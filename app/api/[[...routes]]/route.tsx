/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/next'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
})

async function fetchEpochID() {
  try {
    const response = await fetch('https://uniswapv2.powerloom.io/api/last_finalized_epoch/aggregate_24h_top_pairs_lite:9fb408548a732c85604dacb9c956ffc2538a3b895250741593da630d994b1f27:UNISWAPV2');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.epochId;
  } catch (error) {
    console.error('Error fetching epoch ID:', error);
    throw error;
  }
}

type TokenPair = {
  address: string;
  fee24h: number;
  liquidity: number;
  name: string;
  volume24h: number;
};

async function fetch24hrsTop3Pairs(): Promise<string> {
try {
  const epochId = await fetchEpochID();
  const url = `https://uniswapv2.powerloom.io/api/data/${epochId}/aggregate_24h_top_pairs_lite:9fb408548a732c85604dacb9c956ffc2538a3b895250741593da630d994b1f27:UNISWAPV2/`; // Construct the URL with the fetched epoch ID
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  const top3Pairs = data.pairs.sort((a: TokenPair, b: TokenPair) => b.volume24h - a.volume24h).slice(0, 3);

  return top3Pairs.map((pair: TokenPair) => `${pair.name} with volume: ${pair.volume24h.toFixed(2)}`).join(', ');
} catch (error) {
  console.error('Error fetching top 3 pairs:', error);
  throw error;
}
}

async function fetchUniswapV224hStats() {
  try {
    const epochId = await fetchEpochID();
    const url = `https://uniswapv2.powerloom.io/api/data/${epochId}/aggregate_24h_stats_lite:9fb408548a732c85604dacb9c956ffc2538a3b895250741593da630d994b1f27:UNISWAPV2/`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error fetching 24h stats for UniswapV2:', error);
    throw error; 
  }
}

// mic-testing-123
fetchUniswapV224hStats().then(stats => {
  console.log('24h Stats for UniswapV2:', stats);
}).catch(error => {
  console.error('Failed to fetch 24h stats:', error);
});



app.frame('/', async (c) => {
  const { buttonValue } = c;
  let displayMessage = 'Welcome! to Powerloom';

  if (buttonValue === 'epochid') {
    try {
      const epochId = await fetchEpochID();
      displayMessage = `Current Epoch ID: ${epochId}`;
    } catch (error) {
      console.error('Failed to fetch epoch ID:', error);
      displayMessage = 'Failed to fetch epoch ID';
    }
  } else if (buttonValue === 'threepairs') {
    try {
      const top3PairsText = await fetch24hrsTop3Pairs();
      displayMessage = `Top 3 Pairs: ${top3PairsText}`;
    } catch (error) {
      console.error('Failed to fetch top 3 pairs:', error);
      displayMessage = 'Failed to fetch top 3 pairs';
    }
  } else if (buttonValue === 'uswpv2agg') {
    try {
      const stats = await fetchUniswapV224hStats();
      // Assuming stats is the object shown in your example response
      // Format the stats object into a descriptive string
      const statsText = `24h Stats - 24h Fee: ${stats.fee24h}, 24h TVL: ${stats.tvl}, 24h Volume: ${stats.volume24h}`;
      displayMessage = statsText;
    } catch (error) {
      console.error('Failed to fetch UniswapV2 24h stats:', error);
      displayMessage = 'Failed to fetch UniswapV2 24h stats';
    }
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 24, 
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 20px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {displayMessage}
        </div>
      </div>
    ),
    intents: [
      <Button value="epochid">Get EpochID</Button>,
      <Button value="threepairs">Top 3</Button>,
      <Button value="uswpv2agg">UniswapV2 Total</Button>,
      <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

export const GET = handle(app)
export const POST = handle(app)
