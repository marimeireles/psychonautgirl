export interface NewsItem {
  Title: string;
  Date: string;
  Summary: string;
  Link: string;
}

const dataString =
`Title|Date|Summary|Link
Master's student at the University of Sussex|2026-09-28|Starting a master's in Artificial Life and Consciousness, where I'll be working on complexification: the evolution of learning, intelligence and sensemaking|https://www.sussex.ac.uk/research/centres/sussex-neuroscience/research/consciousness
2027 GoEMMI Winter School|2027 (upcoming)|I'll be there|
Science of Consciousness Conference 2026|2026-10-11 (upcoming)|Poster accepted: The Sophistication of Minds: How Synergy Drives Emergence in the Brain|https://consciousness.arizona.edu/
BlueDot Rapid Grantee|2026-10-01|A Spy in the Swarm: Testing Double Agents for Human Oversight|https://www.overleaf.com/project/6aadbfb4b37acd9be4f128a8/share#83aced967ad1aca9ac98cf19a2e04b821544d819c1ebb9f0
FAST @ NeurIPS 2026|2026-09-30|Paper accepted: Toward collective intelligence: evolutionary pressures for cooperative language models|https://openreview.net/forum?id=q9FzHzVCrn
Collective Intelligence Fellow|2026-07-10|Improving democracy at scale by giving disagreement the proper credit|https://www.cip.org/
Future of Life Institute Grantee|2026-07-20||https://futureoflife.org/about-us/our-people/ai-existential-safety-community/|
Foresight Institute Secure & Sovereign AI Workshop|2026-07-12|Speaking about the future of the Web|https://drive.google.com/file/d/1KoMeTwp9B0hjTZeAiB0a2G7MdUX-bbJ7/view?usp=sharing|
ICML 2026 Supercooperation: The Future of AI for Democracy |2026-07-07|My perspectives on how the structure of disagreement is being dealt with in LLMs|
7th International Conference on the Mathematics of Neuroscience and AI| 2026-06-09|Poster on the development of synergistic cores in LLMs|https://docs.google.com/presentation/d/1EVvv3vadOcvRphoX2rXmXPZ-C6omAOlZbLuYF__XuTU/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168
ICLR 2026|2026-04-20|Presented poster on benchmarking LLM web agents|https://scholar.google.com/citations?view_op=view_citation&hl=en&user=oTW1oIEAAAAJ&citation_for_view=oTW1oIEAAAAJ:zYLM7Y9cAGgC
Cooperative AI Research Fellowship|2026-03-28|Poster on LLM coordination via RLVR through social synchronization|https://docs.google.com/presentation/d/1zWLlQwXBzwCVEY8UFYCmLxaLEG9RzTfwsD_UsSqzpsc/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168
Awarded the Foresight Institute Grant on Secure AI|2026-01-10|Grant to support my work on developing injection resistant LLMs
MADWEB @ NDSS 2025|2025-12-15|Poster on deterministic web environments for LLM agent evaluation|https://scholar.google.com/citations?view_op=view_citation&hl=en&user=oTW1oIEAAAAJ&citation_for_view=oTW1oIEAAAAJ:2osOgNQ5qMEC
NeurIPS 2025|2025-12-09|Poster on how the environment changes multi-agent cooperative LLM systems|https://scholar.google.com/citations?view_op=view_citation&hl=en&user=oTW1oIEAAAAJ&citation_for_view=oTW1oIEAAAAJ:u-x6o8ySG0sC
`

export function parseNews(): NewsItem[] {
    return dataString.split('\n').slice(1).map(line => {
        const [Title, Date, Summary, Link] = line.split('|');
        return {
            Title: Title || '',
            Date: Date || '',
            Summary: Summary || '',
            Link: Link || '',
        };
    }).filter(item => item.Title.trim() !== '');
}
