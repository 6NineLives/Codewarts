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
        "uri": "https://i.imgur.com/hjWXPHA.jpg",
        "format": "image",
        "width": 400,
        "height": 800
      },
      "video": {
        "type": "remote",
        "uri": "https://i.imgur.com/hjWXPHA.mp4",
        "format": "video"
      }
    },
    "contributions": [
      {
        "id": "1",
        "thumbnail": {
          "type": "remote",
          "uri": "https://i.imgur.com/hjWXPHA.jpg",
          "format": "image",
          "width": 400,
          "height": 800
        },
        "video": {
          "type": "remote",
          "uri": "https://i.imgur.com/hjWXPHA.mp4",
          "format": "video"
        }
      },
      {
        "id": "2",
        "thumbnail": {
          "type": "remote",
          "uri": "https://picsum.photos/seed/tanaw-discover-02/400/800",
          "width": 400,
          "height": 800
        }
      },
      {
        "id": "3",
        "thumbnail": {
          "type": "remote",
          "uri": "https://picsum.photos/seed/tanaw-discover-03/400/800",
          "width": 400,
          "height": 800
        }
      },
      {
        "id": "4",
        "thumbnail": {
          "type": "remote",
          "uri": "https://picsum.photos/seed/tanaw-discover-04/400/800",
          "width": 400,
          "height": 800
        }
      }
    ]
  }
} as const satisfies MediaConfig;
