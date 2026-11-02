// DAY 2 · TOPIC 10: Class components (awareness only)
//
// Before hooks (React 16.8), stateful components had to be classes. You will meet
// them in old code bases. New code uses function components and hooks.
// You do not need to write classes. You only need to read them.
//
// Mapping from class to function component:
//
//   Class                                   Function component
//   --------------------------------------  ----------------------------------------
//   this.state = { days: 0 }                const [days, setDays] = useState(0)
//   this.setState({ days: 1 })              setDays(1)
//   this.props.title                        function Comp({ title }) { ... }
//   componentDidMount                       useEffect(() => { ... }, [])
//   componentDidUpdate                      useEffect(() => { ... }, [days])
//   componentWillUnmount                    the cleanup function returned by useEffect
//   handler = () => { ... } (arrow field)   a normal function inside the component
//
// Error boundaries are the one thing that still needs a class (Day 4).
// The two components below do the same thing.

import { Component, useEffect, useState } from "react";

type DaysCounterProps = { title: string };
type DaysCounterState = { days: number };

class DaysCounter extends Component<DaysCounterProps, DaysCounterState> {
  state: DaysCounterState = { days: 0 };

  componentDidMount() {
    document.title = `${this.state.days} day(s) requested`;
  }

  componentDidUpdate() {
    document.title = `${this.state.days} day(s) requested`;
  }

  componentWillUnmount() {
    document.title = "React leave training";
  }

  // Arrow function so `this` still points to the component
  addDay = () => {
    this.setState({ days: this.state.days + 1 });
  };

  render() {
    return (
      <div className="card">
        <h3>{this.props.title}</h3>
        <p>Days requested: {this.state.days}</p>
        <button onClick={this.addDay}>Add day</button>
      </div>
    );
  }
}

function DaysCounterFn({ title }: DaysCounterProps) {
  const [days, setDays] = useState(0);

  // One effect replaces didMount + didUpdate + willUnmount
  useEffect(() => {
    document.title = `${days} day(s) requested`;
    return () => {
      document.title = "React leave training";
    };
  }, [days]);

  return (
    <div className="card">
      <h3>{title}</h3>
      <p>Days requested: {days}</p>
      <button onClick={() => setDays(days + 1)}>Add day</button>
    </div>
  );
}

export default function ClassComponents() {
  return (
    <div>
      <h2>Class components</h2>
      <div className="demo cols-2">
        <DaysCounter title="Class component" />
        <DaysCounterFn title="Function component" />
      </div>
      <p className="note">
        Both cards behave the same. Class components still work in React 19, but they cannot
        use hooks. Only error boundaries still need a class.
      </p>
      <p className="try">
        Try it: click "Add day" on each card and compare the code. Which lifecycle method does
        the function version's cleanup replace?
      </p>
    </div>
  );
}
