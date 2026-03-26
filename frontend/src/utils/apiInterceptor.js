/**
 * This utility intercepts all native 'fetch' calls in the browser
 * and automatically injects the 'x-db-name' header if it exists in localStorage.
 * This enables multi-tenancy without having to rewrite every fetch call in the app.
 */

const originalFetch = window.fetch;

window.fetch = async (...args) => {
    let [resource, config] = args;

    // Default config if not provided
    if (!config) config = {};
    if (!config.headers) config.headers = {};

    // Get the db_name from localStorage
    const dbName = localStorage.getItem("db_name");

    // If we have a db_name, inject it into the headers
    if (dbName) {
        // Handle different header formats (Standard object, Headers object)
        if (config.headers instanceof Headers) {
            config.headers.set('x-db-name', dbName);
        } else {
            config.headers['x-db-name'] = dbName;
        }
    }

    try {
        const response = await originalFetch(resource, config);
        return response;
    } catch (error) {
        console.error("Fetch Interceptor Error:", error);
        throw error;
    }
};

console.log("🚀 API Interceptor initialized: Auto-injecting x-db-name headers");
