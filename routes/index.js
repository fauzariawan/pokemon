const router = require('express').Router();
const API = require('../services/api');
const Probability = require('probability-node');
const ls = require('local-storage');
const isPrime = require('prime-number');
const rn = require('random-number');
var options = {
  min:  1
, max:  1000
, integer: true
}


router.get('/',async (req, res)=>{
  let pokemons = await API.pokemons()
  res.render('index',{pokemons})
})

router.get('/detail', async (req, res)=>{
  try {
    let url = req.query.url
    let pokemonDetail = await API.pokemonDetail(url)
    res.render('pokemon_detail/pokemon_detail', {pokemonDetail})
  } catch (error) {
    console.log(error)
  }
  
})

router.get('/catch', async (req, res)=>{
  var probability = {
    success: 0,
    failed: 0,
  };

  var probabilitilized = Probability(
    {
        p: '50%',                                         
        f: function () {                                  
        probability.success++;
        }
    }, {
        p: '50%',
        f: function () {
          probability.failed++;
        }
    }
  );

  probabilitilized();
  if(probability.success == 1){
    let pokemonDetail = await API.pokemonDetail(`https://pokeapi.co/api/v2/pokemon/${req.query.id}/`)
    pokemonDetail.isCatched = true
    res.render('pokemon_detail/pokemon_detail', {pokemonDetail})
    console.log('anda berhasil menangkap Pokemon ')
    // res.render()
  }else{
    let pokemonDetail = await API.pokemonDetail(`https://pokeapi.co/api/v2/pokemon/${req.query.id}/`)
    pokemonDetail.isCatched = false
    res.render('pokemon_detail/pokemon_detail', {pokemonDetail})
    console.log('anda gagal menangkap Pokemon, ayo coba lagi')
  }
})

router.post('/savePoke/:id', async(req, res)=>{
  let isMyPokemonExist = ls.get('my_pokemons')
  let pokemonDetail = await API.pokemonDetail(`https://pokeapi.co/api/v2/pokemon/${req.params.id}/`)
  pokemonDetail.nick_name = req.body.nick_name
  if(isMyPokemonExist == null){
    ls.set('my_pokemons',[pokemonDetail])
    let myPokemons = [pokemonDetail]
    res.render('pokemon_detail/my_pokemons',{myPokemons})
    console.log('pokemon anda berhasil dibuat')
  }else{
    console.log('menambahkan pokemon baru')
    let myPokemons = ls.get('my_pokemons')
    myPokemons.push(pokemonDetail)
    ls.remove('my_pokemons')
    ls.set('my_pokemons',myPokemons)
    res.render('pokemon_detail/my_pokemons',{myPokemons})
    // console.log(myPokemon)
    // let filterPoke = myPokemon.filter(poke => poke.id == pokemonDetail.id)
    // console.log('setelah di filter')
    // console.log(filterPoke)
  }
  
  // window.localStorage.setItem('my_pokemon', responseJson.my_token)
})

router.get('/my_pokemons', (req, res)=>{
  let myPokemons = ls.get('my_pokemons')
  res.render('pokemon_detail/my_pokemons',{myPokemons})
})

router.get('/release/:id',(req, res)=>{
  let pokemons = ls.get('my_pokemons')
  let myPokemons
  console.log(`release pokemon id : ${req.params.id}`)
  let apakahPrime = isPrime(rn(options))
  console.log(apakahPrime)
  if(apakahPrime == true){
    console.log('masuk ke kondisi TRUE')
    if(pokemons != null) myPokemons = pokemons.filter(poke => poke.id != req.params.id)
    ls.remove('my_pokemons')
    ls.set('my_pokemons', myPokemons)
    myPokemons.release = true
    res.render('pokemon_detail/my_pokemons',{myPokemons})
  }else{
    console.log('masuk ke kondisi FASLE')
    myPokemons = pokemons
    myPokemons.release = false
    res.render('pokemon_detail/my_pokemons',{myPokemons})
  }
})

router.get('/rename/:id',(req, res)=>{
  let pokemons = ls.get('my_pokemons')
  console.log(`rename pokemon id : ${req.params.id}`)
  if(pokemons != null){
    for (let i = 0; i < pokemons.length; i++) {
      if(pokemons[i].id == req.params.id){
        let splitName = pokemons[i].name.split('-')
        if(splitName.length == 1){
          pokemons[i].name = `${pokemons[i].name}-0`
          // pokemons[i].fibbonaciName = `${pokemons[i].name}-0`
          ls.remove('my_pokemons')
          ls.set('my_pokemons', pokemons)
          let myPokemons = pokemons
          res.render('pokemon_detail/my_pokemons',{myPokemons})
        }else{
          console.log('length > 1')
          let splitFN = pokemons[i].name.split('-')
          let number = Number(`${splitFN[1]}`)
          let baseName = splitFN[0]
          if(number == 0){
            console.log('number fibbo = 0')
            pokemons[i].name = `${baseName}-1`
            pokemons[i].fibbonaciName = `${baseName}-0`
            ls.remove('my_pokemons')
            ls.set('my_pokemons', pokemons)
            let myPokemons = pokemons
            res.render('pokemon_detail/my_pokemons',{myPokemons})
          }else{
            console.log('number fibbo > 0')
            let fiName = pokemons[i].fibbonaciName.split('-')
            let tonumber = Number(`${fiName[1]}`)
            let sum = number+tonumber
            pokemons[i].name = `${baseName}-${sum}`
            pokemons[i].fibbonaciName = `${baseName}-${number}`
            ls.remove('my_pokemons')
            ls.set('my_pokemons', pokemons)
            let myPokemons = pokemons
            res.render('pokemon_detail/my_pokemons',{myPokemons})
          }
        }
      }
    }
  }
})


module.exports = router