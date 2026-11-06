// The handbook's nine sections, in the order a new engineer should read them.
// One list drives both the sidebar (astro.config.mjs) and the home page index,
// so adding a section is a one-line change here plus a folder in src/content/docs/.
//
//   dir    folder under src/content/docs/ (folder = section)
//   label  sidebar heading
//   tab    short name for the index tabs on the home page
//   start  the page to open first
//   about  one line on what the section is for

export const sections = [
	{ dir: 'start-here', start: '/start-here/overview/', label: 'Start here', tab: 'start', about: 'What this handbook is, your first week, and what to do when something breaks.' },
	{ dir: 'architecture', start: '/architecture/system-overview/', label: 'Architecture', tab: 'architecture', about: 'What the system is made of, how data moves through it, and why it was built that way.' },
	{ dir: 'infrastructure', start: '/infrastructure/inventory/', label: 'Infrastructure', tab: 'infra', about: 'Every server, account, domain and environment, and where each one lives.' },
	{ dir: 'services', start: '/services/', label: 'Services', tab: 'services', about: 'One page per service: what it does, how to run it, what it depends on.' },
	{ dir: 'development', start: '/development/local-setup/', label: 'Development', tab: 'dev', about: 'Set up a machine, find your way around the code, test it and ship it.' },
	{ dir: 'operations', start: '/operations/automation-inventory/', label: 'Operations', tab: 'ops', about: 'Deploys, backups, monitoring, and every task that used to run by itself.' },
	{ dir: 'runbooks', start: '/runbooks/', label: 'Runbooks', tab: 'runbooks', about: 'Step-by-step fixes for specific problems, written to be followed under stress.' },
	{ dir: 'access', start: '/access/access-inventory/', label: 'Access & security', tab: 'access', about: 'Who can reach what, where the secrets are kept, and how to rotate them.' },
	{ dir: 'reference', start: '/reference/glossary/', label: 'Reference', tab: 'reference', about: 'Glossary, contacts, page templates, and the commands you will use often.' },
];
