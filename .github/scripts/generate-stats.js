const fs = require('fs');
const axios = require('axios');

const token = process.env.GH_TOKEN;
const username = process.env.GITHUB_USER;

const headers = {
  Authorization: `token ${token}`,
  'User-Agent': username
};

// Générer le top langs
async function generateTopLangs() {
  const repos = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
  const langMap = {};

  repos.data.forEach(repo => {
    if(repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });

  // Créer SVG simple
  let svg = `<svg width="400" height="30" xmlns="http://www.w3.org/2000/svg">`;
  let x = 0;
  Object.entries(langMap).forEach(([lang, count], idx) => {
    svg += `<text x="${x}" y="20" font-size="14">${lang}: ${count} </text>`;
    x += 80;
  });
  svg += `</svg>`;

  fs.writeFileSync('top-langs.svg', svg);
}

// Générer les stats globales (commits privés inclus)
async function generateGitHubStats() {
  const events = await axios.get(`https://api.github.com/users/${username}/events`, { headers });
  const totalCommits = events.data.reduce((acc, event) => {
    if(event.type === 'PushEvent') return acc + event.payload.commits.length;
    return acc;
  }, 0);

  const svg = `<svg width="400" height="30" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="20" font-size="16">Total recent commits: ${totalCommits}</text>
  </svg>`;

  fs.writeFileSync('github-stats.svg', svg);
}

(async () => {
  await generateTopLangs();
  await generateGitHubStats();
})();
