interface BlogWindowProps {
  blogName: string;
}

export const BlogWindow = ({ blogName }: BlogWindowProps) => {
  const blogContent = {
    "Software": {
      emoji: "💻",
      content: (
        <div className="space-y-3 text-sm">
          <p>I've worked as a software engineer with a focus on scientific development for several years. All of this work was within open-source organizations.</p>
          <p>I'm a core contributor to projects such as Jupyter, Firefox, Mamba, Conda Forge, Farama's Zoo, PyScript, PySide, Mozilla Webcompat, Qt, and others.</p>
          <p>Currently I'm affiliated with the Open Knowledge Foundation as an Expert.</p>
          <p>In the past, I served as a member of the Jupyter technical committee, as a member of the DISC NumFOCUS steering committee, as a Max Planck Insitute Open Science Ambassator and as a Subject Matter Expert for NASA, developing a <a href="https://www.nasa.gov/news-release/new-course-from-nasa-helps-build-open-inclusive-science-community/" target="_blank" className="text-primary hover:underline">course</a> aimed at providing guidance for scientists on practicing open science.</p>
          <p>I've also taught open science and software classes to graduate students at Harvard through the LSSTC-DSFP program and at <a href="http://github.com/marimeireles/talks" target="_blank" className="text-primary hover:underline">several other</a> conferences, meetups, and groups. I'm also grateful for the Jupyter community having recognized me as a <a href="https://blog.jupyter.org/congratulations-distinguished-contributors-bc349fa60d68" target="_blank" className="text-primary hover:underline">distinguished contributor</a> in early 2022.</p>
        </div>
      ),
    },
    "Research": {
      emoji: "🔬",
      content: (
        <div className="space-y-3 text-sm">
          <p>As a researcher I'm interested in understanding what are the underlying characteristics that are important for fostering cooperation among different intelligences and creating a bright future for human and AIs alike.</p>
          <div className="win95-border bg-muted p-2">
            <h4 className="font-bold mb-1">Focus Areas</h4>
            <ul className="space-y-1 text-xs">
              <li>• Coordination & cooperative AI</li>
              <li>• Evolutionary biology & teleology</li>
              <li>• Reinforcement learning</li>
              <li>• Complex systems</li>
              <li>• Ethics</li>
            </ul>
          </div>
          <p className="text-xs"><a href="https://github.com/marimeireles/talks/" target="_blank" className="text-primary hover:underline">Academic work →</a></p>
          {/*<p className="text-xs"><a href="https://techforgoodresearch.substack.com/" target="_blank" className="text-primary hover:underline">Read my research blog →</a></p>*/}
        </div>
      ),
    },
    "Community": {
      emoji: "🦄",
      content: (
        <div className="space-y-3 text-sm">
          <p>I flourish by having the support, serendipity and positive feedback loops that a community brings. Do you want to learn or practice something together? Send me a message! If you want, you can also send me anonymous feedback <a href="https://www.admonymous.co/marimeireles" target="_blank" className="text-primary hover:underline">here</a>.</p>
          <div className="win95-border bg-muted p-2">
            <h4 className="font-bold mb-1">Activities</h4>
            <ul className="space-y-2 text-xs">
              <li>• <b>Supper and salon</b>: I host vegan dinners and salons in Berlin. Themes we talked about in the past include "The limits of free speech", "Spirituality and rituals", "Rethinking future socio-economic structures and institutions", "How to be moral", etc. If you are a Berliner or a passer-by and would like to join we welcome first-timers, just send me an email!
                <ul className="ml-4 mt-1"><li>↪ If we're on a 1:1 I'm happy to have discussions that abide to the <a href="https://www.lesswrong.com/w/crockers-rules" target="_blank" className="text-primary hover:underline">Crocker's Rules</a>.</li></ul>
              </li>
              <li>• <b>Buddhism and meditation</b>: I practice Dzogchen Tibetan Buddhism. That said, I was a part of many religious traditions in the past and I enjoy very much learning about all kinds of different cults and spiritual communities. I'm part of an <a href="https://aroencyclopaedia.org/shared/text/i/information_in_01_introduction_eng.php" target="_blank" className="text-primary hover:underline">Aro</a> sangha in Berlin and you're welcome to join us if you're interested and respectful, the sangha is religious. I'm interested in meditating with others and sharing curious states of consciousness (non-related with drug-usage as I do my best to follow the <a href="https://www.parallax.org/mindfulnessbell/article/dharma-talk-five-wonderful-precepts/" target="_blank" className="text-primary hover:underline">five precepts</a>).</li>
              <li>• <b>Literature</b>: I really enjoy learning through reading and exploring new worlds through text. I try to keep an up-to-date <a href="/reading-list.html" target="_blank" className="text-primary hover:underline">reading list</a>, maybe we can chill in a cafe or park and talk about ideas we had after reading together. I also write or post short texts or poems I like <a href="https://lettersfortheevanescents.mataroa.blog/" target="_blank" className="text-primary hover:underline">here</a>.</li>
              <li>• <b>Multimedia Artist</b>: It's really fun to be the girl taking care of lights at events. I've built my own DMX controller, and I'm somewhat versed in being scrappy with electronics. I also try to be artsy with Touch Designer, I mainly focus on interactive art. Check some of my <a href="https://github.com/marimeireles/touchdesigner-toes/tree/master" target="_blank" className="text-primary hover:underline">toes</a>. Here's a <a href="https://www.behance.net/marianameireles" target="_blank" className="text-primary hover:underline">link</a> for a portfolio I'm building. I'm open for hire and to collaborate in this kind of work.</li>
              <li>• <b>Drawing</b>: I'm a <a href="https://www.deviantart.com/marimeireles/gallery" target="_blank" className="text-primary hover:underline">beginner tattoo artist</a>. Tattoing is a very special practice to me, something I consider truly sacred and ritualistic. I'm open to tattooing new people, if you're interested, send me an email. I'm looking to get a Sak Yant done, please let me know if you know anyone in Europe or the US that is able to bless it. I tattoo myself and friends. I also know the basics of painting with spray, and I want to learn more, I would very much like to learn together. I also want to improve in watercolor and drawing, for that I like to go out on small friend dates and paint city/landscapes.</li>
              <li>• <b>AI Art*</b>: In the past, I've experimented with <a href="https://colab.research.google.com/drive/1hcUHPLk98zN_V89Z0U5nMUhabPjWk05k?userstoinvite=zeynepsatir35%40gmail.com&actionButton=1" target="_blank" className="text-primary hover:underline">GANs</a> and created some <a href="https://www.deviantart.com/marimeireles/gallery/82011542/gan-designs-2021" target="_blank" className="text-primary hover:underline">cool tattoo designs</a>. I've also worked with story telling and agent-based modeling LLMs. Would love to collaborate with artists as a software engineer! For more of my AI projects check my <a href="https://www.behance.net/marianameireles" target="_blank" className="text-primary hover:underline">Behance</a>.</li>
              <li>• <b>Music</b>: Music theory, music producing (mainly electronic but also interested in analog jams), djing, foxdot(and similar shenanigans). I play the guitar and sing a bit, trying to be better at my Bossa Nova. Also looking for riot grrrls to play some punk rock with.</li>
              <li>• <b>Flow</b>: Dragon staff, hula-hoop, fire flow, yoga. Anything flowey, I'm always looking for people to share these practices with.</li>
              <li>• <b>Sports</b>: I am practicing calisthenics mixed in with some free weight lifting. I think it's fun to practice with friends, as we can teach each other stuff. I go to a nearby calisthenics park, but open to travel for a calisthenics date. I also really like bouldering and am member at a cool climbing gym! If interested, ask me which.</li>
            </ul>
          </div>
        </div>
      ),
    },
    "Activism": {
      emoji: "🌈",
      content: (
        <div className="space-y-3 text-sm">
          <p>I support several causes: <a href="https://ethicalsource.dev/" target="_blank" className="text-primary hover:underline">ethical open source</a>, <a href="https://en.wikipedia.org/wiki/Animal_Liberation_(book)" target="_blank" className="text-primary hover:underline">animal liberation</a>, the <a href="https://ourworldindata.org/environmental-impacts-of-food?insight=differences-carbon-footprint-foods#key-insights-on-the-environmental-impacts-of-food" target="_blank" className="text-primary hover:underline">decrease</a> in animal-based products consumption, investing in carbon offsets to decrease my CO2 footprint, leveraging democracy through <a href="https://pol.is/home" target="_blank" className="text-primary hover:underline">open democratic practices</a>, <a href="https://postmeritocracy.org/" target="_blank" className="text-primary hover:underline">post meritocracy</a> in my engineering work context, combating disinformation on the Web, <a href="https://80000hours.org/problem-profiles/artificial-intelligence/" target="_blank" className="text-primary hover:underline">AI alignment</a>, <a href="https://ia600605.us.archive.org/15/items/GuerillaOpenAccessManifesto/Goamjuly2008.pdf" target="_blank" className="text-primary hover:underline">open access to knowledge</a>, empowering people to overcome poverty using a) <a href="https://marimeireles.notion.site/Poverty-alleviation-6cc16e6e2e3e49d19ed9112aec79d5cf?pvs=4" target="_blank" className="text-primary hover:underline">non-traditional methods of pedagogy</a>, b) <a href="https://marimeireles.notion.site/Poverty-alleviation-6cc16e6e2e3e49d19ed9112aec79d5cf?pvs=4" target="_blank" className="text-primary hover:underline">land redistribution coupled with permaculture</a> and community building in rural contexts c) offering OSS opportunities through <a href="https://marimeireles.notion.site/Poverty-alleviation-6cc16e6e2e3e49d19ed9112aec79d5cf?pvs=4" target="_blank" className="text-primary hover:underline">internships</a> and <a href="https://marimeireles.com/mentorship.html" target="_blank" className="text-primary hover:underline">mentoring</a> d) respecting people's agency over their own economical future through <a href="https://www.givedirectly.org/" target="_blank" className="text-primary hover:underline">donating money directly</a> to them.</p>
          <div className="win95-border bg-muted p-2">
            <h4 className="font-bold mb-1">Projects I Support</h4>
            <ul className="space-y-1 text-xs">
              <li>• <a href="https://www.linkedin.com/company/84894279/" target="_blank" className="text-primary hover:underline">Women of Color Code</a></li>
              <li>• <a href="https://www.redi-school.org/" target="_blank" className="text-primary hover:underline">ReDI School</a></li>
              <li>• <a href="https://berlin.pyladies.com/" target="_blank" className="text-primary hover:underline">PyLadies Berlin</a></li>
              <li>• <a href="https://www.frauenloop.org/" target="_blank" className="text-primary hover:underline">Frauen Loop</a></li>
            </ul>
          </div>
          <p className="text-xs">I believe women have the right to have full control over their own bodies:</p>
          <div className="win95-border bg-muted p-2">
            <ul className="space-y-1 text-xs">
              <li>• <a href="https://fragdenstaat.de/aktionen/219a/" target="_blank" className="text-primary hover:underline">Frag Den Staat</a>: Doctors in Germany are not allowed to post factual information on abortions on their websites. This organization is currently providing resources on the subject in German, English, and Turkish.</li>
              <li>• <a href="https://www.womenonwaves.org/en/" target="_blank" className="text-primary hover:underline">Women on Waves</a>: A Dutch NGO bringing reproductive health services to women in countries with restrictive abortion laws. If the value of their products is inaccessible to you, I want to help, send me an email.</li>
            </ul>
          </div>
        </div>
      ),
    },
  };

  const blog = blogContent[blogName as keyof typeof blogContent];

  if (!blog) {
    return (
      <div className="win95-border-inset bg-white p-4 text-center">
        <p className="text-muted-foreground">Content not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="win95-border bg-gradient-to-r from-primary/10 to-accent/20 p-3 text-center">
        <div className="text-3xl mb-2">{blog.emoji}</div>
        <h2 className="text-lg font-bold text-primary">{blogName}</h2>
      </div>

      <div className="win95-border-inset bg-white p-3 max-h-[400px] overflow-y-auto">
        {blog.content}
      </div>
    </div>
  );
};
