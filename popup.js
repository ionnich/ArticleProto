// Define the list of domains to check for in open tabs
const domainsToCheck = ['bridesblush.com', 'thefashionball.com', 'thedaddest.com', 'sneakertoast.com', 'instantlymodern.com', 'fabcrunch.com', 'drivepedia.com', 'cleverclassic.com', 'ballercap.com', 'bigglobaltravel.com'];

// Get references to HTML elements in the popup
const saveArticlesButton = document.getElementById('saveArticlesButton');
const nameTextField = document.getElementById('nameTextField');
const todaysArticlesList = document.getElementById('todaysArticlesList');
const headlinesList = document.getElementById('headlinesList');
const campaignsList = document.getElementById('campaignsList');
const campaignsToggle = document.getElementById('campaignsToggle');
const exportButton = document.getElementById('exportButton');
const resetbutton = document.getElementById('resetbutton');


// Add event listeners to the popup elements
saveArticlesButton.addEventListener('click', saveArticles);
exportButton.addEventListener('click', exportData);

articlesArr = []
headlinesArr = []
campaignsArr = []
username = ''

// if there is data in Chrome Storage, load it
chrome.storage.sync.get(['articles', 'headlines', 'campaigns', 'name'], function(result) {
    if (result.articles) {
        articlesArr = result.articles;
    }
    if (result.headlines) {
        headlinesArr = result.headlines;
    }
    if (result.campaigns) {
        campaignsArr = result.campaigns;
    }
    if (result.name) {
        username = result.name;
    }
    renderArticles();
    renderHeadlines();
    renderCampaigns();
    renderName();
});

// render the articles in the Today's Articles list
function renderArticles() {
    // add the articles to the list
    for (const article of articlesArr) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = article;
        link.target = '_blank';
        link.textContent = article;
        listItem.appendChild(link);
        todaysArticlesList.appendChild(listItem);
    }
}

// render the headlines in the Headlines list
function renderHeadlines(){
  // add the headlines to the list
  for (const headline of headlinesArr) {
    const listItem = document.createElement('li');
    listItem.textContent = headline;
    headlinesList.appendChild(listItem);
  }
}

function saveToChrome(){
    chrome.storage.sync.set({
        articles: articlesArr,
        headlines: headlinesArr,
        campaigns: campaignsArr,
        name: username
      }, function() {
        console.log('Data saved to Chrome Storage');
      });
  }


// Save the URLs of all open tabs that match the domainsToCheck list
function saveArticles() {
  const name = nameTextField.value.trim();
  if (name === '') {
    alert('Please enter your name before saving articles.');
    return;
  }

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const urlsToSave = [];
    for (const tab of tabs) {
      if (domainsToCheck.some((domain) => tab.url.includes(domain))) {
        urlsToSave.push(tab.url);
      }
    }

    username = name;
    saveToTodaysArticles(urlsToSave);
    saveToHeadlines(urlsToSave);
    saveToCampaigns(urlsToSave, name);

    // save the data to Chrome Storage
    saveToChrome();
  });
}

// Save the given URLs to the Today's Articles list
function saveToTodaysArticles(urls) {
  for (const url of urls) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.textContent = url;
    listItem.appendChild(link);
    todaysArticlesList.appendChild(listItem);
    articlesArr.push(url);
  }
}

// Save the headlines from the given URLs to the Headlines list
function saveToHeadlines(urls) {
  for (const url of urls) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const headline = html.match(/<title>(.*?)<\/title>/)[1];
        const listItem = document.createElement('li');
        listItem.textContent = headline;
        headlinesList.appendChild(listItem);
        headlinesArr.push(headline);
      })
      .catch(error => console.error(error));
  }
}

// Save the campaign names from the given URLs to the Campaigns list
function saveToCampaigns(urls, name) {
  for (const url of urls) {
    const campaignName = extractCampaignName(url, name);
    if (campaignName !== '') {
      const listItem = document.createElement('li');
      listItem.textContent = campaignName;
      campaignsList.appendChild(listItem);
      campaignsArr.push(campaignName);
    }
  }
}

// Extract the campaign name from the given URL, using the user's name and today's date
function extractCampaignName(url, name) {
  const date = new Date().toLocaleString('default', { month: 'short' }) + new Date().getDate().toString().padStart(2, '0');
  const urlParts = url.split('/');
  for (let i = urlParts.length - 1; i >= 0; i--) {
    const part = urlParts[i];
    if (part.includes('-') && !part.startsWith('http')) {
      return `${part}-${name}-${date}`;
    }
  }
  return null;
}

// add event listener to export button
exportButton.addEventListener('click', exportData);

// Export the data within the arrays to an excel file with the following columns:
// Article    Headline    Campaign
// width: 100
function exportData() {
  const data = [];
  for (let i = 0; i < articlesArr.length; i++) {
    data.push([articlesArr[i], headlinesArr[i], campaignsArr[i]]);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'data.xlsx');
}
// import XSLX from 'xlsx';


function renderCampaigns() {
    // add the campaigns to the list
    for (const campaign of campaignsArr) {
        const listItem = document.createElement('li');
        listItem.textContent = campaign;
        campaignsList.appendChild(listItem);
    }
}

function renderName() {
    nameTextField.value = username;
}

window.addEventListener('beforeunload', function(event) {
  saveToChrome();
});
  
// chrome.storage.sync.get(['articles'], function(result) {
//   if (result.articles) {
//     articlesArr = result.articles;
//     renderArticles();
//   }
// });

// chrome.storage.sync.get(['headlines'], function(result) {
//     if (result.headlines) {
//         headlinesArr = result.headlines;
//         renderHeadlines();
//     }
//     }
// );
// chrome.storage.sync.get(['campaigns'], function(result) {
//     if (result.campaigns) {
//         campaignsArr = result.campaigns;
//         renderCampaigns();
//     }
//     }
// );
// chrome.storage.sync.get(['name'], function(result) {
//     if (result.name) {
//         username = result.name;
//         renderName();
//     }
//     }
// );
