// Datafeed implementation that you will add later
import Datafeed from './datafeed.js';

window.tvWidget = new TradingView.widget({
    symbol: 'RELIANCE',            // Default symbol pair
    interval: '1D',                        // Default interval
    fullscreen: true,                      // Displays the chart in the fullscreen mode
    container: 'tv_chart_container',       // Reference to an attribute of a DOM element
    datafeed: Datafeed,
    library_path: '../charting_library_cloned_data/charting_library/',
});

// window.tvWidget = new TradingView.widget({
//     symbol: 'RELIANCE',                        // Default symbol
//     interval: '1W',                            // Set default interval to daily
//     fullscreen: true,                          // Displays the chart in fullscreen mode
//     container: 'tv_chart_container',           // Reference to an attribute of a DOM element
//     datafeed: Datafeed,                        // Your custom datafeed implementation
//     library_path: '../charting_library_cloned_data/charting_library/',
//     // Optional: other configurations
//     height: 600,                               // Set the height of the chart
//     width: '100%',                             // Set the width of the chart
//     timezone: 'Etc/UTC',                       // Set the timezone as needed
//     theme: 'light',                            // Set the chart theme (light/dark)
//     toolbar_bg: '#f1f3f6',                    // Background color of the toolbar
//     hide_side_toolbar: false,                  // Show or hide side toolbar
//     supported_resolutions: ['1D', '1W', '1M'], // Ensure supported resolutions include daily
// });