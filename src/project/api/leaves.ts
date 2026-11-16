import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLeave, getLeave, getLeaves, updateLeaveStatus } from "../../api/leaves";
import type { LeaveRequest, LeaveStatus, NewLeave } from "../../types";

// All server data for the project goes through these hooks (TanStack Query).
// Pages never copy leaves into useState.
//
// Cache keys. Lists share the prefix ["leaves", "list"], so one setQueriesData call can
// update every list at once, and ["leaves"] invalidates everything.
export const leaveKeys = {
  all: ["leaves"] as const,
  lists: ["leaves", "list"] as const,
  mine: ["leaves", "list", "mine"] as const,
  team: ["leaves", "list", "team"] as const,
  detail: (id: number) => ["leaves", "detail", id] as const,
};

// Demo switch: when true, the next status changes fail on the server (HTTP 500).
// It is a plain variable on purpose (not React state): only the mutation reads it.
export const simulation = { failMutations: false };

// All of my own requests. The page filters and counts them while rendering.
export function useMyLeaves() {
  return useQuery({ queryKey: leaveKeys.mine, queryFn: ({ signal }) => getLeaves({}, undefined, signal) });
}

// Manager only: the server answers 403 for an Employee
export function useTeamLeaves() {
  return useQuery({ queryKey: leaveKeys.team, queryFn: ({ signal }) => getLeaves({ scope: "team" }, undefined, signal) });
}

export function useLeave(id: number, enabled: boolean) {
  return useQuery({ queryKey: leaveKeys.detail(id), queryFn: ({ signal }) => getLeave(id, undefined, signal), enabled });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leave: Omit<NewLeave, "employee">) => createLeave(leave),
    onSettled: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

// Cancel, approve and reject are all "change the status", so they share one optimistic hook.
export function useChangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: LeaveStatus }) =>
      updateLeaveStatus(id, status, { fail: simulation.failMutations }),

    // 1. Before the request: show the new status at once.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: leaveKeys.all }); // stop old refetches overwriting us
      // Snapshot everything we are about to change, so we can undo it
      const lists = queryClient.getQueriesData<LeaveRequest[]>({ queryKey: leaveKeys.lists });
      const detail = queryClient.getQueryData<LeaveRequest>(leaveKeys.detail(id));

      queryClient.setQueriesData<LeaveRequest[]>({ queryKey: leaveKeys.lists }, (old) =>
        old?.map((leave) => (leave.id === id ? { ...leave, status } : leave)),
      );
      queryClient.setQueryData<LeaveRequest>(leaveKeys.detail(id), (old) => (old ? { ...old, status } : old));
      return { lists, detail, id };
    },

    // 2. The server said no: put the snapshot back (rollback)
    onError: (_error, _vars, context) => {
      context?.lists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context) queryClient.setQueryData(leaveKeys.detail(context.id), context.detail);
    },

    // 3. Success or failure: refetch so the screen matches the server
    onSettled: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}
