# Add support for energy data

Currently the mezatag data is stored like this

```json
  {
    "name": "Zacian",
    "types": [
      "Fairy",
      "Steel"
    ],
    "stats": {
      "hp": 152,
      "attack": 175,
      "defense": 120,
      "spAtk": 85,
      "spDef": 120,
      "speed": 153
    },
    "move": {
      "name": "Behemoth Blade",
      "type": "Steel"
    },
    "imageUrl": "https://archives.bulbagarden.net/media/upload/thumb/2/2c/Zacian_1-001.png/250px-Zacian_1-001.png"
  }
```

Need to add support for Energy. This energy is a summary of a mezatag power, the higher the energy it means it generally stronger. Energy will be beneficial in getting high score in Trainer battle (future feature consideration).

On the recommendation list, Energy will be tie breaker in the sort list. If the offensive and defensive score is the same, lower Energy has higher priority.

The new mezatag data will look like this:
```json
  {
    "name": "Zacian",
    "types": [
      "Fairy",
      "Steel"
    ],
    "energy": 162,
    "stats": {
      "hp": 152,
      "attack": 175,
      "defense": 120,
      "spAtk": 85,
      "spDef": 120,
      "speed": 153
    },
    "move": {
      "name": "Behemoth Blade",
      "type": "Steel"
    },
    "imageUrl": "https://archives.bulbagarden.net/media/upload/thumb/2/2c/Zacian_1-001.png/250px-Zacian_1-001.png"
  }
```

This Energy will also show in the UI as part of the Pokemon name. When showing Pokemon name in the UI follow this example Zacian(162).

