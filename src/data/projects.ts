export interface Project {
  Name: string;
  Description: string;
  Status: string;
  Tags: string;
}

const dataString =
`Name,Description,Status,Tags
Bird tracker,Current apps for bird tracking don't recognize birds and don't offer a cute interface with good bird pictures. Claude SOTA is really good at identifying them. I'd like to host a simpler model as a classifier (maybe even a local model?) and pull pictures from wikipedia in order to track a bird.,To-do,AI;Web;IOS`

export function parseProjects(): Project[] {
    return dataString.split('\n').slice(1).map(line => {
        const [Name, Description, Status, Tags] = line.split(',');
        return {
            Name: Name || '',
            Description: Description || '',
            Status: Status || '',
            Tags: Tags || '',
        };
    }).filter(project => project.Name.trim() !== '');
}
