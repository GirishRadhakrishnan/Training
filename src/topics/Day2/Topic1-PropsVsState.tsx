// DAY 2 · TOPIC 1: Props vs state
//
// Props are the inputs a component receives from its parent. They are read-only:
// the component must never change them.
// State is memory that belongs to one component. When it changes, React renders
// that component again.
//
// Rule of thumb: if the parent decides the value, it is a prop. If the component
// itself changes the value over time, it is state.
//
// Below, two BalanceCard components get different props. Each one has its own
// state, so clicking a button in one card does not change the other card.

import { useState } from "react";
// 1. Define the props type
type BalanceCardProps = {
  title: string;
  allowed: number; // prop: set by the parent, read-only
};

//Initialize and calculate state
function BalanceCard({ title, allowed }: BalanceCardProps) {
  const [requested, setRequested] = useState(0); // state: owned by this card
  const remaining = allowed - requested;

  return (
    <div className="card">
      <h3>{title}</h3>
      <p>Allowed (prop): {allowed}</p>
      <p>Requested (state): {requested}</p>
      <p>Remaining: {remaining}</p>
      {/* //updates state when clicked, but does not change the prop */}
      <button onClick={() => setRequested(requested + 1)} disabled={remaining === 0}>
        Request 1 day
      </button>
      {/* <button onClick={() => setRequested(requested - 1)} disabled={requested === 0}>
        Cancel 1 day
      </button> */}
    </div>
  );
}
// class Counter extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { count: 0 };
//     this.increment = this.increment.bind(this);   // easy to forget
//   }
//   componentDidMount() { /* fetch data, add listeners */ }
//   componentDidUpdate() { /* react to changes */ }
//   componentWillUnmount() { /* clean up */ }
//   increment() { this.setState({ count: this.state.count + 1 }); }
//   render() { return <button onClick={this.increment}>{this.state.count}</button>; }
// }


export default function PropsVsState() {
  return (
    <div>
      <h2>Props vs state</h2>
      <div className="demo cols-2">
        {/* here we are passing props to the BalanceCard component */}
        <BalanceCard title="Annual leave" allowed={15} />
        <BalanceCard title="Casual leave" allowed={15} />
      </div>
      <p className="try">
        Try it: click "Request 1 day" on the Casual card until it is disabled. Then check that
        the Annual card did not change. Which value is a prop and which is state?
      </p>
    </div>
  );
}
