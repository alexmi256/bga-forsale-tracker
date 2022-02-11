let players = {};
let processedLogs = [];
let getProperty = new RegExp('(?<player>.+) (passes|wins the round) and pays (?<payAmount>\\d+) k\\$ for property (?<propertyValue>\\d+)');
let getCash = new RegExp('(?<player>.+) offers property (?<propertyValue>\\d+) and receives the (?<cashValue>\\d+) k\\$ card');
let playerCurrencySectionStrId = 'player_currency_card_counter_section_p';
let playerCoinsSectionStrId = 'player_coins_section_p';
let availableProperties = [...Array(30).keys()].map((x) => x + 1);
let availableCash = [...Array(16).keys()].slice(2).concat([...Array(16).keys()].slice(2)).concat([0, 0]).sort((a, b) => a - b);

function updateScores() {
    document.querySelectorAll('.player-name').forEach((x) => {
        if (!(x.innerText in players)) {
            players[x.innerText] = { money: 14, properties: [], id: x.getAttribute('id').split('_')[2] }
        }
    })

    Array.from(document.querySelectorAll('.log[id^=log_]')).map((x) => {
        return {
            text: x.querySelector('.roundedbox').innerText,
            id: x.getAttribute('id'),
        }
    }).forEach((x) => {
        // Only process logs once
        if (!processedLogs.includes(x.id)) {
            // For first round when paying for properties
            if (getProperty.test(x.text)) {
                let { player, payAmount, propertyValue } = getProperty.exec(x.text).groups;
                payAmount = parseInt(payAmount);
                propertyValue = parseInt(propertyValue);

                players[player].money -= payAmount;
                players[player].properties.push(propertyValue);
                players[player].properties.sort((a, b) => a - b);
                players[player].properties.reverse();

                let coinsDisplay = document.getElementById(playerCoinsSectionStrId + players[player].id);
                if (coinsDisplay.style.display === 'none') {
                    coinsDisplay.style.display = 'inline';
                }
                let cardsDisplay = document.getElementById(playerCurrencySectionStrId + players[player].id);
                if (cardsDisplay.style.display === 'none') {
                    cardsDisplay.style.display = 'inline';
                }

                let cardsInsert = document.getElementById('player_currency_card_counter_p' + players[player].id);
                cardsInsert.innerHTML = players[player].properties.join(',');
                let coinsInsert = document.getElementById('player_coins_p' + players[player].id);
                coinsInsert.innerHTML = players[player].money;

                availableProperties.splice(availableProperties.indexOf(propertyValue), 1)
                console.info(`Remaining properties are: ${availableProperties}`);

                // For second round when auctionining properties
            } else if (getCash.test(x.text)) {
                let { player, cashValue, propertyValue } = getCash.exec(x.text).groups;
                cashValue = parseInt(cashValue);
                propertyValue = parseInt(propertyValue);
                players[player].properties.splice(players[player].properties.indexOf(propertyValue), 1)
                players[player].properties.sort((a, b) => a - b);
                players[player].properties.reverse();

                let bidDisplay = document.getElementById('player_bid_section_p' + players[player].id);
                if (bidDisplay.style.display === 'none') {
                    bidDisplay.style.display = 'inline';
                }

                let bidInsert = document.getElementById('player_bid_p' + players[player].id);
                bidInsert.innerHTML = players[player].properties.join(',');

                availableCash.splice(availableCash.indexOf(cashValue), 1)
                console.info(`Remaining cash cards are: ${availableCash}`);
            }

            processedLogs.push(x.id);
        }
    });
}

setInterval(updateScores, 10000);

