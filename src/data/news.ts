export interface NewsItem {
  Title: string;
  Date: string;
  Summary: string;
  Link: string;
}

const dataString =
`Title|Date|Summary|Link
Foresight Institute Secure & Sovereign AI Workshop|(Upcoming) 2026-07-12|Speaking on hardening AI systems against prompt injection|
ICML 2026 Supercooperation: The Future of AI for Democracy |(Upcoming) 2026-07-07|My perspectives on how the structure of disagreement is being dealt with in LLMs|
7th International Conference on the Mathematics of Neuroscience and AI| 2026-06-09|Poster on the development of synergistic cores in LLMs|https://docs.google.com/presentation/d/1EVvv3vadOcvRphoX2rXmXPZ-C6omAOlZbLuYF__XuTU/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168
ICLR 2026|2026-04-20|Presented poster on benchmarking LLM web agents|https://scholar.google.com/citations?view_op=view_citation&hl=en&user=oTW1oIEAAAAJ&citation_for_view=oTW1oIEAAAAJ:zYLM7Y9cAGgC
Cooperative AI Research Fellowship|2026-03-28|Poster on LLM coordination via RLVR through social synchronization|https://docs.google.com/presentation/d/1zWLlQwXBzwCVEY8UFYCmLxaLEG9RzTfwsD_UsSqzpsc/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168
Awarded the Foresight Institue Grant on Secure AI|2026-01-10|Grant to support my work on developing injection resistant LLMs
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
