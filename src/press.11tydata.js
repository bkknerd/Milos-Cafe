// The press page is only built when it's switched on in the CMS (Press → Show this page).
export default { eleventyComputed: { permalink: (d) => (d.press && d.press.enabled ? "/press/index.html" : false) } };
