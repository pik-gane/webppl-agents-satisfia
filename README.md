# webppl-agents-satisfia

Extension of webppl-agents with [additional non-maximizing agent types](/src/agents/makeMDPAgentSatisfia.wppl)

Intelligent agents that satisfy aspirations. This is part of the SatisfIA project. That project's main code repository is [satisfia](https://github.com/pik-gane/satisfia).

![image](https://github.com/pik-gane/webppl-agents-satisfia/assets/22815964/00ddc643-710b-42cc-b1a5-cde382fe1d3f)

To test:
```
./run.sh examples/runVerySimpleGW.wppl -- --gw GW3 --verbose
```


## Usage

Once installed, you can make the environment and agent functions available to `program.wppl` by running:

    ./run.sh program.wppl

## Testing

Run the included test using:

    ./test.sh

## License

MIT

## Additions in this fork:

We added a non-maximizing agent based on aspiration levels: `makeMDPAgentSatisfia`.
Rather than maximizing the return, this agent is given an initial aspiration point or interval `aleph0` and uses a policy that produce a return (here called `total`) whose expectation equals this point or falls into this interval, if that is possible.
To achieve this, the agent propagates the initial aspiration from step to step, taking into account the reward (here called `delta`) it gets and the possible total that is still achievable from the current state. It does so in such a way that the total equals the initial aspiration in expectation, using what we call "aspiration rescaling". 

Since there are in general many possible policies that fulfil the constraint regarding the expected total, the agent will use a number of additional criteria to determine its actions.
In each timestep, it will use a mix of actions that can satisfy the aspiration in expectation, selected on the basis of a loss function mixed from, amongst others, the following terms using adjustable loss coefficients:
- variance of resulting total
- squared deviation of the local relative aspiration (the relative position of an action's Q-value in the feasible interval) of each step from 0.5
- "messing potential" (maximal trajectory entropy that one may produce from the successor state when taking a certain action)
- behavioral entropy of the policy
- deviation from a reference policy (KL divergence)
- "power" as measured by the squared width of the interval of feasible totals
- other user-supplied safety loss terms
- random noise

