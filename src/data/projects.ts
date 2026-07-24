export interface Project {
  Name: string;
  Description: string;
  Status: string;
  Tags: string;
}

const dataString =
`Name|Description|Status|Tags
From paint to life|What if I train a classifier that translates low->high dimensions. E.g.: things that look like an apple in a very low dimension (like a red circle with a little stem coming out of it) are actually "apple". I can then search for the texture of an apple somewhere in a trustworthy database and add into the drawing?
The cool thing about it would be the method it uses to learn how to identify the low level > high level.
Some interesting algorithm I come up with that learns how to read emergence in an "optimized way" (rather than a boring neural network) would be more fun.
But maybe some intermediate step of a diffusion model could also yield interesting results.|to-do|AI;web
Browser addon for social media usage control|Logs you out from a list of websites every time you re-open the tab you must login again. (This might be a good starting point though needs heavy refactoring, etc. https://github.com/v-adhithyan/AutoLogout)|to-do|web
Bird tracker|Current apps for bird tracking don't recognize birds and don't offer a cute interface with good bird pictures.
Claude SOTA is really good at identifying them. I'd like to host a simpler model as a classifier (maybe even a local model?)
and pull pictures from wikipedia in order to track a bird.|to-do|AI;web;IOS;birds
Recovering dynamic activations that govern fruit fly behaviors|Using the known fruit fly connectome as a fixed wiring diagram, we model the fly's brain activation dynamics, recording brain-wave patterns across many behavioral conditions 
(e.g. walking, flying, feeding, courtship). We then solve the inverse problem of inferring the single set of synaptic weights (connection signs and strengths) that reproduces the observed activity across all conditions. We use Kuramoto/Winfree/Others model in order to confirm that the activations are correctly emulating the brain wave patterns recorded on real specimen. Using a diversity of inputs and behaviors, we intend to overcome the ill-posedness that any single recording would have, generalizing across the fly's behavioral repertoire. The nature paper "Prediction of neural activity in connectome-constrained recurrent networks" could be a good starting point.|to-do|AI;theoretical-neuroscience;synchrony
Dynamical system simulations inside SimCity|Using this software https://github.com/marimeireles/simcity-threejs-clone we can build dynamical systems simulations that we would like to test in a real city.|to-do|dynamical-systems;web;urbanism
`

export function parseProjects(): Project[] {
    // A complete row has exactly 3 pipes (4 fields). Keep appending lines until
    // we reach that count — this allows multi-line descriptions even when the
    // trailing fields (status, tags) land on a continuation line.
    const rows: string[] = [];
    let buffer = '';
    for (const line of dataString.split('\n')) {
        if (line.trim() === '') continue;
        buffer = buffer === '' ? line : `${buffer} ${line.trim()}`;
        const pipeCount = (buffer.match(/\|/g) || []).length;
        if (pipeCount >= 3) {
            rows.push(buffer);
            buffer = '';
        }
    }
    return rows.slice(1).map(row => {
        const [Name, Description, Status, Tags] = row.split('|');
        return {
            Name: Name || '',
            Description: Description || '',
            Status: Status || '',
            Tags: Tags || '',
        };
    }).filter(project => project.Name.trim() !== '');
}
