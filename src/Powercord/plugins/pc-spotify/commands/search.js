const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
    command: 'search',
    description: 'Searches for a song and plays it!',
    usage: '{c} {song}',
    executor(args) {
        const isPremium = getModule(['isSpotifyPremium'], false).isSpotifyPremium();
        if (!isPremium) {
            return {
                send: false,
                result: 'Oops, it looks like you are not a Spotify Premium member. Unfortunately, this feature isn\'t available to you as per Spotify\'s requirements.'
            };
        }
        if (!args[0]) {
            return {
                send: false,
                result: `You need to specify a song to search for and play!`
            }
        }

        SpotifyAPI.search(args.join(" "), 'track', 1).then((body) => {
            let tracksArray = body['tracks']['items']
            if (tracksArray.length > 0) {
                let trackURL = tracksArray[0]['uri']
                return SpotifyAPI.play({
                    'uris': [trackURL]
                })
            } else {
                return {
                    send: false,
                    result: `Couldn't find a song!`
                }
            }
        })

    }
};