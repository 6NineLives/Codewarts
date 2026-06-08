/**
 * AUTO-GENERATED from config/media.yml — do not edit by hand.
 * Run: npm run config:sync
 */
import type { MediaConfig } from './media.types';

export const mediaConfig = {
  "create": {
    "defaults": {
      "illustration": {
        "type": "remote",
        "uri": "https://imgur.com/df4U8Kp",
        "format": "video",
        "width": 150,
        "height": 150
      }
    },
    "challenges": [
      {
        "id": "challenge-1",
        "signKey": "GOOD_AFTERNOON",
        "illustration": {
          "type": "remote",
          "uri": "https://imgur.com/df4U8Kp",
          "format": "video",
          "width": 150,
          "height": 150
        }
      }
    ]
  },
  "discover": {
    "defaults": {
      "thumbnail": {
        "type": "remote",
        "uri": "https://i.imgur.com/RLEFkAl.jpg",
        "format": "image",
        "width": 400,
        "height": 800
      },
      "video": {
        "type": "remote",
        "uri": "https://i.imgur.com/RLEFkAl.mp4",
        "format": "video"
      }
    },
    "contributions": [
      {
        "id": "1",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/RLEFkAl.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/RLEFkAl.mp4",
          "format": "video"
        }
      },
      {
        "id": "2",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/IZKcyXP.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/IZKcyXP.mp4",
          "format": "video"
        }
      },
      {
        "id": "3",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/Folheba.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/Folheba.mp4",
          "format": "video"
        }
      },
      {
        "id": "4",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/CcCp3mG.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/CcCp3mG.mp4",
          "format": "video"
        }
      },
      {
        "id": "5",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/qXlEn7d.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/qXlEn7d.mp4",
          "format": "video"
        }
      },
      {
        "id": "6",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/8m2GaaM.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/8m2GaaM.mp4",
          "format": "video"
        }
      },
      {
        "id": "7",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/N3uUA9o.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/N3uUA9o.mp4",
          "format": "video"
        }
      },
      {
        "id": "8",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/z3OyqGS.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/z3OyqGS.mp4",
          "format": "video"
        }
      }
    ]
  }
} as const satisfies MediaConfig;
