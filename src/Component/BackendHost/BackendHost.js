const ReturnHostBackend = (env_url) => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        return env_url;
    } else {
        return (
            window.location.protocol +
            "//" +
            window.location.host.split(":")[0] +
            env_url
        );
    }
};

const ReturnHostWS = (env_url) => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        return env_url;
    } else {
        return "wss://" + window.location.host.split(":")[0] + env_url;
    }
};

const ReturnHostMQTT = (env_url) => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        return env_url;
    } else {
        return window.location.host.split(":")[0] + env_url;
    }
};

export { ReturnHostBackend, ReturnHostWS, ReturnHostMQTT };
