const axios = require('axios')

class API {
  static async pokemons(){
    try {
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
        return pokeDetail
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