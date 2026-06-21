export interface Project {
  Name: string;
  Description: string;
  Status: string;
  Tags: string;
}

const dataString =
`Name|Description|Status|Tags
Bird tracker|Current apps for bird tracking don't recognize birds and don't offer a cute interface with good bird pictures.
Claude SOTA is really good at identifying them. I'd like to host a simpler model as a classifier (maybe even a local model?)
and pull pictures from wikipedia in order to track a bird.|to-do|AI;web;IOS;birds
Recovering dynamic activations that govern fruit fly behaviors|Using the known fruit fly connectome as a fixed wiring diagram,
we model the fly's brain activation dynamics, recording brain-wave patterns across many behavioral conditions 
(e.g. walking, flying, feeding, courtship).
We then solve the inverse problem of inferring the single set of synaptic weights (connection signs and strengths)
that reproduces the observed activity across all conditions. We use Kuramoto/Winfree/Others model in order to confirm that the
activations are correctly emulating the brain wave patterns recorded on real specimen. Using a diversity of inputs and behaviors,
we intend to overcome the ill-posedness that any single recording would have, generalizing across the fly's behavioral repertoire.
The nature paper "Prediction of neural activity in connectome-constrained recurrent networks" could be a good starting point.|to-do|AI;theoretical-neuroscience;synchrony
Dynamical system simulations inside SimCity|Using this software https://github.com/marimeireles/simcity-threejs-clone we can build dynamical systems simulations that we would like to test in a real city.|to-do|dynamical-systems;web;urbanism
`

export function parseProjects(): Project[] {
    return dataString.split('\n').slice(1).map(line => {
        const [Name, Description, Status, Tags] = line.split('|');
        return {
            Name: Name || '',
            Description: Description || '',
            Status: Status || '',
            Tags: Tags || '',
        };
    }).filter(project => project.Name.trim() !== '');
}
