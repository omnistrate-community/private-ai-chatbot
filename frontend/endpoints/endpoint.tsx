function getSaaSDomainURL() {
    let saasURL = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!saasURL || saasURL === "undefined") {
      saasURL = "/api"
    }
  
    return saasURL
  }

export var API_ENDPOINTS = {
    SIGNIN: getSaaSDomainURL() + `/user/signin`,
    SIGNUP: getSaaSDomainURL() + `/user`,
    PROFILE: getSaaSDomainURL() + `/user/profile`,
    CHAT: getSaaSDomainURL() + `/chat`,
}