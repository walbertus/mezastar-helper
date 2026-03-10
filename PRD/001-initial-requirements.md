# Mezastar Helper

This service is used to help build team to fight trainer or wild battle on [Mezastar](https://world.pokemonmezastar.com/id/howto/). This service primarily support Indonesia region with future possibilities to support other regions.

## More info

Mezatag is a physical tag containing one Pokemon.
Pokemon with missing data should be removed.
Mezatag only contain 1 Pokemon with one move type.
Mezatag move contain Move Name and Type.
Mezatag Pokemon contain name, image, HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed.
Pokemon can have multiple Types.

## User Stories

1. Given an enemy Pokemon, give list of Pokemon recommendation which has the best move to attack and best type to defend.
  1. User search the enemy Pokemon name from the search bar. This search is case insensitive using substring search.
  1. User click one of the Pokemon shown from the list
  1. User see top 6 list of recommended Pokemon to deploy to battle. The list will only show the Name and Mezatag image from Bulbapedia.
  There are three lists, one for attack and one for defence and one for 50/50 between attack and defence. If image failed to load show placeholder image. This recommendation will only consider the type of Pokemon and the move, it does not consider Pokemon stat.


## Deployment

This service will be deployed with Github Pages. This service hold no state of the user's Pokemon


## Technical Requirements

- Unit Test for logic should exist with coverage at least 80%.
- All code with external library/source should use Adapter pattern.
- Use vanilla typescript for frontend framework.
- Data source for type match should be in file committed to the repo. The source is from pokemondb.net
- Pokemon mezatag list need to crawled from external source, if possible store it in file instead.
- Build using Vite for github pages.
- Create Github action to automatically deploy this service as github page.
- Use Material design for the UI component. Use color theme that represent "Forest"
- UI in mobile for multiple long list should use collapsible sections.

Type matchup data structure example
```json
{
  "Bug":{
    "Normal": 1.0,
    "Fire": 0.5,
    "Grass": 2.0
  }
}

# This mean Bug attack Normal is normal, Bug attack Fire is not very effective, Bug attack Grass is very effective
```

## Future Consideration

- Possibility to store User's Pokemons so the recommendation list can be filtered only to show owned Pokemon.
- Possibility for user to give set of three or four Pokemons to get complete battle recommendation

## References

- [Pokemon types and chart](https://pokemondb.net/type)
- [Pokemon dual types and chart](https://pokemondb.net/type/dual)
- [Material Design](https://m3.material.io/)

List of Mezatag and moves can be found in these links.
- [Mezatag List set 1](https://bulbapedia.bulbagarden.net/wiki/Set_1_(Mezastar))
- [Mezatag List set 2](https://bulbapedia.bulbagarden.net/wiki/Set_2_(Mezastar))
- [Mezatag List set 3](https://bulbapedia.bulbagarden.net/wiki/Set_3_(Mezastar))
- [Mezatag List set 4](https://bulbapedia.bulbagarden.net/wiki/Set_4_(Mezastar))