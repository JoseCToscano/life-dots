module.exports = {
    extends: [
        // ... other extends
    ],
    rules: {
        // ... other rules
        "react/no-unescaped-entities": ["warn", { "forbid": [">", "}"] }],
    },
}; 