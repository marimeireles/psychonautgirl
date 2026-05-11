export interface NewsItem {
  Title: string;
  Date: string;
  Summary: string;
  Link: string;
}

const dataString =
`Title|Date|Summary|Link
Foresight Institute Secure & Sovereign AI Workshop|(Upcoming) 2026-07-12|Speaking on hardening AI systems against prompt injection|
Neuromonster 2026|(Upcoming) 2026-06-09|Poster on the development of emergence in LLMs|
ICLR 2026|2026-04-20|Presented poster on benchmarking LLM web agents|https://scholar.google.com/citations?view_op=view_citation&hl=en&user=oTW1oIEAAAAJ&citation_for_view=oTW1oIEAAAAJ:zYLM7Y9cAGgC
Cooperative AI Research Fellowship|2026-03-28|Presented poster on LLM coordination via RLVR|https://docs.google.com/presentation/d/1zWLlQwXBzwCVEY8UFYCmLxaLEG9RzTfwsD_UsSqzpsc/edit?slide=id.g3a3e10a3c29_0_168#slide=id.g3a3e10a3c29_0_168
MADWEB @ NDSS 2025|2025-12-15|Presented poster on deterministic web environments for LLM agent evaluation|https://scholar.google.com/citations?view_op=view_citation&hl=en&user=oTW1oIEAAAAJ&citation_for_view=oTW1oIEAAAAJ:2osOgNQ5qMEC
NeurIPS 2025|2025-12-09|Presented poster on the effects that scaffolding has on multi-agent cooperative LLM systems|https://scholar.google.com/citations?view_op=view_citation&hl=en&user=oTW1oIEAAAAJ&citation_for_view=oTW1oIEAAAAJ:u-x6o8ySG0sC
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
