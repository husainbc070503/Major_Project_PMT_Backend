require('dotenv').config();
const { default: axios } = require("axios");
const qs = require('querystring');

const Authorization = () => `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&scope=profile%20email%20w_member_social%20openid`;


const Redirect = async (code, body) => {
    const payload = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URL,
        code
    };

    const res1 = await axios({
        url: `https://www.linkedin.com/oauth/v2/accessToken?${qs.stringify(payload)}`,
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }).then((res) => { return res; })
        .catch((err) => { return err; });

    const data1 = await res1.data;

    const res2 = await axios({
        url: "https://api.linkedin.com/v2/userinfo",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data1?.access_token}`
        }
    });

    const data2 = await res2.data;

    const details = {
        "author": `urn:li:person:${data2.sub}`,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": `${body.text} Team: ${body.team?.join(",")}`,
                },
                "shareMediaCategory": "ARTICLE",
                "media": [
                    {
                        "status": "READY",
                        "description": {
                            "text": "Github"
                        },
                        "originalUrl": body.github,
                        "title": {
                            "text": "Project Github Repository"
                        }
                    }
                ]
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    const res3 = await axios.post('https://api.linkedin.com/v2/ugcPosts', details, {
        headers: {
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
            Authorization: `Bearer ${data1?.access_token}`
        }
    });

    const data3 = await res3.data;
    if (data3.id)
        return `https://www.linkedin.com/feed/update/${data3.id}`;
}

module.exports = { Authorization, Redirect };