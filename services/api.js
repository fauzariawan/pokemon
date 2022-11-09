const axios = require('axios')
const Redis = require('redis')
const redisClient = Redis.createClient()
const DEFAULT_EXP = 3600
redisClient.on('error', (err) => console.log('Redis Client Error', err));
class API {
  static async pokemons(){
    try {
      await redisClient.connect()
      const pokemons = await redisClient.get('pokemons');
      if(pokemons == null ){
        let result = await axios({
          method: 'get',
          url: 'https://pokeapi.co/api/v2/pokemon',
          headers: {
            'Content-Type': 'text/plain',
          }
        })
        let status = result.status
        let headers = JSON.parse(JSON.stringify(result.headers))
        let response = JSON.parse(JSON.stringify(result.data))
        if(status == 200){
          let pokeDetail = response.results
          for (let index = 0; index < pokeDetail.length; index++) {
              let result = await axios({
                method: 'get',
                url: pokeDetail[index].url,
                headers: {
                  'Content-Type': 'text/plain',
                }
              })
              pokeDetail[index].image = result.data.sprites.front_default
          }
          await redisClient.setEx('pokemons', DEFAULT_EXP, JSON.stringify(pokeDetail))
          await redisClient.disconnect();
          return pokeDetail
        }
      }else{
        await redisClient.disconnect();
        return JSON.parse(pokemons)
      }
      return null
    } catch (error) {
      console.log(error)
      return error
    }
  }

  static async pokemonDetail(url){
    try {
      let result = await axios({
        method: 'get',
        url,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
      let status = result.status
      let headers = JSON.parse(JSON.stringify(result.headers))
      let response = JSON.parse(JSON.stringify(result.data))

      if(status == 200){
        let moves = []
        let types = []
        response.moves.forEach(move => {
          moves.push(move.move.name)
        });
        response.types.forEach(type => {
          types.push(type.type.name)
        })
        let pokeDetail = {
          id: response.id,
          name: response.name,
          image: response.sprites.front_default,
          height: response.height,
          weight: response.weight,
          moves,
          types
        }
        return pokeDetail
      }
      return null
    } catch (error) {
      console.log(error)
      return error
    }
  }
}

module.exports = API