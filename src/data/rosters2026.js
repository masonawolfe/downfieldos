// Auto-generated from nflverse depth charts + snap counts (2026 season)
// NOTE: rating is a SNAP-SHARE PROXY (68-85 base by snap share + exp
// modifier), not a player evaluation. See rating_source on each row. UI
// should render this under an honest label — "Snap share tier" or similar.
// CoS audit 2026-08-30 finding #4.
// Generated: 2026-09-20T15:13:22.091Z
// Sources: depth_charts_2026.csv, snap_counts_2026.csv, roster_2026.csv, availability_2026.json
// Do not edit manually — re-run: SEASON=2026 node scripts/fetch-nflverse-roster-base.js
// E-044 (2026-09-20): each starter row carries a `candidates` array
// (pos_rank 1-3 pool) so the board build can re-pick against today's
// availability at ship time. ROSTERS_META.availability_stamp names the
// availability snapshot the reconciler last used.

export const ROSTERS_2026 = {
  "ARI": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0033119",
        "name": "Jacoby Brissett",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033119",
            "name": "Jacoby Brissett",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035289",
            "name": "Gardner Minshew II",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041561",
            "name": "Carson Beck",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0041027",
        "name": "Jeremiyah Love",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041027",
            "name": "Jeremiyah Love",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037263",
            "name": "Tyler Allgeier",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037157",
            "name": "Bam Knight",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0037263",
        "name": "Tyler Allgeier",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041027",
            "name": "Jeremiyah Love",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037263",
            "name": "Tyler Allgeier",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037157",
            "name": "Bam Knight",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0038559",
        "name": "Michael Wilson",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038559",
            "name": "Michael Wilson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039849",
            "name": "Marvin Harrison Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033307",
            "name": "Kendrick Bourne",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039849",
        "name": "Marvin Harrison Jr.",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038559",
            "name": "Michael Wilson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039849",
            "name": "Marvin Harrison Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033307",
            "name": "Kendrick Bourne",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0033307",
        "name": "Kendrick Bourne",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038559",
            "name": "Michael Wilson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039849",
            "name": "Marvin Harrison Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033307",
            "name": "Kendrick Bourne",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0037744",
        "name": "Trey McBride",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037744",
            "name": "Trey McBride",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039041",
            "name": "Elijah Higgins",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037004",
            "name": "Hunter Long",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0038540",
        "name": "Paris Johnson Jr.",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038540",
            "name": "Paris Johnson Jr.",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040382",
            "name": "Josh Fryar",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0032954",
        "name": "Isaac Seumalo",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032954",
            "name": "Isaac Seumalo",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040219",
            "name": "Hayden Conner",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0035258",
        "name": "Hjalte Froholdt",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035258",
            "name": "Hjalte Froholdt",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038571",
            "name": "Jon Gaines II",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039808",
        "name": "Isaiah Adams",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039808",
            "name": "Isaiah Adams",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038571",
            "name": "Jon Gaines II",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041468",
            "name": "Chase Bisontis",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0033676",
        "name": "Elijah Wilkinson",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033676",
            "name": "Elijah Wilkinson",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041113",
            "name": "Jayden Williams",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0038623",
        "name": "Dante Stills",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038623",
            "name": "Dante Stills",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034381",
            "name": "Josh Sweat",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040137",
            "name": "Jordan Burch",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039854",
            "name": "Darius Robinson",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038782",
            "name": "Eku Leota",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0034381",
        "name": "Josh Sweat",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038623",
            "name": "Dante Stills",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034381",
            "name": "Josh Sweat",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040137",
            "name": "Jordan Burch",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039854",
            "name": "Darius Robinson",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038782",
            "name": "Eku Leota",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0036568",
        "name": "Roy Lopez",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036568",
            "name": "Roy Lopez",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040706",
            "name": "Walter Nolen III",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035636",
            "name": "L.J. Collier",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033066",
            "name": "Andrew Billings",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037804",
            "name": "Zachary Carter",
            "posAbb": "LDT",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041555",
            "name": "Kaleb Proctor",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0037596",
        "name": "Jack Gibbens",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037596",
            "name": "Jack Gibbens",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036933",
            "name": "Zaven Collins",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035144",
            "name": "Mack Wilson Sr.",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036995",
            "name": "Baron Browning",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041093",
            "name": "Karson Sharar",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040645",
            "name": "Cody Simon",
            "posAbb": "MLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0036933",
        "name": "Zaven Collins",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037596",
            "name": "Jack Gibbens",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036933",
            "name": "Zaven Collins",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035144",
            "name": "Mack Wilson Sr.",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036995",
            "name": "Baron Browning",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041093",
            "name": "Karson Sharar",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040645",
            "name": "Cody Simon",
            "posAbb": "MLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0040751",
        "name": "Will Johnson",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040751",
            "name": "Will Johnson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040195",
            "name": "Denzel Burke",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038984",
            "name": "Kei'Trel Clark",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039007",
            "name": "Garrett Williams",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0040195",
        "name": "Denzel Burke",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040751",
            "name": "Will Johnson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040195",
            "name": "Denzel Burke",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038984",
            "name": "Kei'Trel Clark",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039007",
            "name": "Garrett Williams",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039807",
        "name": "Max Melton",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039807",
            "name": "Max Melton",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039239",
            "name": "Kalen King",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0035378",
        "name": "Andrew Wingard",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035378",
            "name": "Andrew Wingard",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041370",
            "name": "Wydett Williams Jr.",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040230",
            "name": "Kitan Crawford",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0033890",
        "name": "Budda Baker",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033890",
            "name": "Budda Baker",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039864",
            "name": "Dadrion Taylor-Demerson",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "ATL": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0036212",
        "name": "Tua Tagovailoa",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Michael Penix Jr. (Out)",
        "candidates": [
          {
            "gsis_id": "00-0039917",
            "name": "Michael Penix Jr.",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036212",
            "name": "Tua Tagovailoa",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033662",
            "name": "Cooper Rush",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0038542",
        "name": "Bijan Robinson",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038542",
            "name": "Bijan Robinson",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037746",
            "name": "Brian Robinson Jr.",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036984",
            "name": "Trey Sermon",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0037746",
        "name": "Brian Robinson Jr.",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038542",
            "name": "Bijan Robinson",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037746",
            "name": "Brian Robinson Jr.",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036984",
            "name": "Trey Sermon",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0037238",
        "name": "Drake London",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037238",
            "name": "Drake London",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037741",
            "name": "Jahan Dotson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035208",
            "name": "Olamide Zaccheaus",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0037741",
        "name": "Jahan Dotson",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037238",
            "name": "Drake London",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037741",
            "name": "Jahan Dotson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035208",
            "name": "Olamide Zaccheaus",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0035208",
        "name": "Olamide Zaccheaus",
        "grade": "Average",
        "rating": 70,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037238",
            "name": "Drake London",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037741",
            "name": "Jahan Dotson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035208",
            "name": "Olamide Zaccheaus",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0036970",
        "name": "Kyle Pitts Sr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036970",
            "name": "Kyle Pitts Sr.",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036429",
            "name": "Charlie Woerner",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032392",
            "name": "Austin Hooper",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0031279",
        "name": "Jake Matthews",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031279",
            "name": "Jake Matthews",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039842",
            "name": "Michael Jerrell",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040687",
            "name": "Cameron Williams",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0039048",
        "name": "Matthew Bergeron",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039048",
            "name": "Matthew Bergeron",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036354",
            "name": "Kyle Hinton",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0036833",
        "name": "Ryan Neuzil",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036833",
            "name": "Ryan Neuzil",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033793",
            "name": "Corey Levin",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0035630",
        "name": "Chris Lindstrom",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035630",
            "name": "Chris Lindstrom",
            "posAbb": "RG",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0035237",
        "name": "Jawaan Taylor",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035237",
            "name": "Jawaan Taylor",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039842",
            "name": "Michael Jerrell",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041121",
            "name": "Ethan Onianwa",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0039859",
        "name": "Brandon Dorlus",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039859",
            "name": "Brandon Dorlus",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036204",
            "name": "LaCale London",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034371",
            "name": "Da'Shawn Hand",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038980",
            "name": "Zach Harrison",
            "posAbb": "RDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0036204",
        "name": "LaCale London",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039859",
            "name": "Brandon Dorlus",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036204",
            "name": "LaCale London",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034371",
            "name": "Da'Shawn Hand",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038980",
            "name": "Zach Harrison",
            "posAbb": "RDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0039070",
        "name": "Gervon Dexter Sr.",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039070",
            "name": "Gervon Dexter Sr.",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039889",
            "name": "Maason Smith",
            "posAbb": "NT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041484",
            "name": "Anterio Thompson",
            "posAbb": "NT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0036990",
        "name": "Divine Deablo",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036990",
            "name": "Divine Deablo",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041066",
            "name": "Kendal Daniels",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033945",
            "name": "Samson Ebukam",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031576",
            "name": "Za'Darius Smith",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037815",
            "name": "Cameron Thomas",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040056",
            "name": "Jared Ivey",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041112",
            "name": "Harold Perkins Jr.",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037823",
            "name": "Christian Harris",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038580",
            "name": "Yasir Abdullah",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0034801",
            "name": "Josh Woods",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039370",
            "name": "JD Bertrand",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040578",
            "name": "James Pearce Jr.",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0041066",
        "name": "Kendal Daniels",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036990",
            "name": "Divine Deablo",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041066",
            "name": "Kendal Daniels",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033945",
            "name": "Samson Ebukam",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031576",
            "name": "Za'Darius Smith",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037815",
            "name": "Cameron Thomas",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040056",
            "name": "Jared Ivey",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041112",
            "name": "Harold Perkins Jr.",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037823",
            "name": "Christian Harris",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038580",
            "name": "Yasir Abdullah",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0034801",
            "name": "Josh Woods",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039370",
            "name": "JD Bertrand",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040578",
            "name": "James Pearce Jr.",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0034843",
        "name": "Mike Hughes",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034843",
            "name": "Mike Hughes",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036285",
            "name": "A.J. Terrell Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036281",
            "name": "C.J. Henderson",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034639",
            "name": "Mike Ford Jr.",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041188",
            "name": "Malcolm DeWalt IV",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0036285",
        "name": "A.J. Terrell Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034843",
            "name": "Mike Hughes",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036285",
            "name": "A.J. Terrell Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036281",
            "name": "C.J. Henderson",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034639",
            "name": "Mike Ford Jr.",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041188",
            "name": "Malcolm DeWalt IV",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039002",
        "name": "Sydney Brown",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Billy Bowman Jr. (Out)",
        "candidates": [
          {
            "gsis_id": "00-0040156",
            "name": "Billy Bowman Jr.",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039002",
            "name": "Sydney Brown",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041469",
            "name": "Avieon Terrell",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0040148",
        "name": "Xavier Watts",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040148",
            "name": "Xavier Watts",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039002",
            "name": "Sydney Brown",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0034675",
        "name": "Jessie Bates III",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034675",
            "name": "Jessie Bates III",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038628",
            "name": "DeMarcco Hellams",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "BAL": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0034796",
        "name": "Lamar Jackson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034796",
            "name": "Lamar Jackson",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035993",
            "name": "Tyler Huntley",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040981",
            "name": "Joe Fagnano",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0032764",
        "name": "Derrick Henry",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032764",
            "name": "Derrick Henry",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034975",
            "name": "Justice Hill",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039796",
            "name": "Rasheen Ali",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0034975",
        "name": "Justice Hill",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032764",
            "name": "Derrick Henry",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034975",
            "name": "Justice Hill",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039796",
            "name": "Rasheen Ali",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036550",
        "name": "Rashod Bateman",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Zay Flowers (Out)",
        "candidates": [
          {
            "gsis_id": "00-0039064",
            "name": "Zay Flowers",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036550",
            "name": "Rashod Bateman",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039792",
            "name": "Devontez Walker",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039792",
        "name": "Devontez Walker",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039064",
            "name": "Zay Flowers",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036550",
            "name": "Rashod Bateman",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039792",
            "name": "Devontez Walker",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0034753",
        "name": "Mark Andrews",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034753",
            "name": "Mark Andrews",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034798",
            "name": "Durham Smythe",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040879",
            "name": "Matthew Hibner",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0032965",
        "name": "Ronnie Stanley",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032965",
            "name": "Ronnie Stanley",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040070",
            "name": "Carson Vinson",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0036369",
        "name": "John Simpson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036369",
            "name": "John Simpson",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038383",
            "name": "Andrew Vorhees",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0038629",
        "name": "Jovaughn Gwyn",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038629",
            "name": "Jovaughn Gwyn",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033901",
            "name": "Ethan Pocic",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036215",
            "name": "Danny Pinter",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0040866",
        "name": "Olaivavega Ioane",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040866",
            "name": "Olaivavega Ioane",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040068",
            "name": "Emery Jones Jr.",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0039233",
        "name": "Roger Rosengarten",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039233",
            "name": "Roger Rosengarten",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040098",
            "name": "Gerad Lichtenhan",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0026190",
        "name": "Calais Campbell",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0026190",
            "name": "Calais Campbell",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036130",
            "name": "Nnamdi Madubuike",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036081",
            "name": "Broderick Washington Jr.",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040076",
            "name": "Aeneas Peebles",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0036081",
        "name": "Broderick Washington Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Nnamdi Madubuike (Out)",
        "candidates": [
          {
            "gsis_id": "00-0026190",
            "name": "Calais Campbell",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036130",
            "name": "Nnamdi Madubuike",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036081",
            "name": "Broderick Washington Jr.",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040076",
            "name": "Aeneas Peebles",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0037756",
        "name": "Travis Jones",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037756",
            "name": "Travis Jones",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0030070",
            "name": "John Jenkins",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0034874",
        "name": "Roquan Smith",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034874",
            "name": "Roquan Smith",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038505",
            "name": "Tavius Robinson",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033935",
            "name": "Trey Hendrickson",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040069",
            "name": "Teddye Buchanan",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038504",
            "name": "Trenton Simpson",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040722",
            "name": "Mike Green",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041494",
            "name": "Zion Young",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040100",
            "name": "Jay Higgins IV",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040978",
            "name": "Ethan Burke",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039460",
            "name": "Carl Jones",
            "posAbb": "LILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0038505",
        "name": "Tavius Robinson",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034874",
            "name": "Roquan Smith",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038505",
            "name": "Tavius Robinson",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033935",
            "name": "Trey Hendrickson",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040069",
            "name": "Teddye Buchanan",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038504",
            "name": "Trenton Simpson",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040722",
            "name": "Mike Green",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041494",
            "name": "Zion Young",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040100",
            "name": "Jay Higgins IV",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040978",
            "name": "Ethan Burke",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039460",
            "name": "Carl Jones",
            "posAbb": "LILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039232",
        "name": "Nate Wiggins",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039232",
            "name": "Nate Wiggins",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033281",
            "name": "Marlon Humphrey",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033548",
            "name": "Chidobe Awuzie",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039234",
            "name": "T.J. Tampa",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040073",
            "name": "Bilhal Kone",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0033281",
        "name": "Marlon Humphrey",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039232",
            "name": "Nate Wiggins",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033281",
            "name": "Marlon Humphrey",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033548",
            "name": "Chidobe Awuzie",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039234",
            "name": "T.J. Tampa",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040073",
            "name": "Bilhal Kone",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0038038",
        "name": "Kyle Hamilton",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038038",
            "name": "Kyle Hamilton",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040636",
            "name": "Keyon Martin",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040885",
            "name": "Chandler Rivers",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0040688",
        "name": "Malaki Starks",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040688",
            "name": "Malaki Starks",
            "posAbb": "FS",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0036302",
        "name": "Jaylinn Hawkins",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036302",
            "name": "Jaylinn Hawkins",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040104",
            "name": "Keondre Jackson",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040988",
            "name": "Jahquez Robinson",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "BUF": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0034857",
        "name": "Josh Allen",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034857",
            "name": "Josh Allen",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034577",
            "name": "Kyle Allen",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0037248",
        "name": "James Cook III",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037248",
            "name": "James Cook III",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039875",
            "name": "Ray Davis",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035537",
            "name": "Ty Johnson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0039875",
        "name": "Ray Davis",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037248",
            "name": "James Cook III",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039875",
            "name": "Ray Davis",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035537",
            "name": "Ty Johnson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0037261",
        "name": "Khalil Shakir",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: DJ Moore (Out)",
        "candidates": [
          {
            "gsis_id": "00-0034827",
            "name": "DJ Moore",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037261",
            "name": "Khalil Shakir",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039901",
            "name": "Keon Coleman",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039901",
        "name": "Keon Coleman",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034827",
            "name": "DJ Moore",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037261",
            "name": "Khalil Shakir",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039901",
            "name": "Keon Coleman",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0038933",
        "name": "Dalton Kincaid",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038933",
            "name": "Dalton Kincaid",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035689",
            "name": "Dawson Knox",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040194",
            "name": "Jackson Hawes",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0033904",
        "name": "Dion Dawkins",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033904",
            "name": "Dion Dawkins",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041548",
            "name": "Jude Bowry",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0037428",
        "name": "Alec Anderson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037428",
            "name": "Alec Anderson",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034261",
            "name": "Austin Corbett",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0035679",
        "name": "Connor McGovern",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035679",
            "name": "Connor McGovern",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036391",
            "name": "Lloyd Cushenberry III",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0038548",
        "name": "O'Cyrus Torrence",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038548",
            "name": "O'Cyrus Torrence",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041128",
            "name": "Ar'maj Reed-Adams",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0036976",
        "name": "Spencer Brown",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036976",
            "name": "Spencer Brown",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039882",
            "name": "Tylan Grable",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0040132",
        "name": "Landon Jackson",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Ed Oliver (Out), T.J. Sanders (Out)",
        "candidates": [
          {
            "gsis_id": "00-0035230",
            "name": "Ed Oliver",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040724",
            "name": "T.J. Sanders",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040132",
            "name": "Landon Jackson",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039873",
            "name": "DeWayne Carter",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038099",
            "name": "Phidarian Mathis",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041091",
            "name": "Zane Durant",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0039873",
        "name": "DeWayne Carter",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035230",
            "name": "Ed Oliver",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040724",
            "name": "T.J. Sanders",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040132",
            "name": "Landon Jackson",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039873",
            "name": "DeWayne Carter",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038099",
            "name": "Phidarian Mathis",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041091",
            "name": "Zane Durant",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0040710",
        "name": "Deone Walker",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040710",
            "name": "Deone Walker",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035667",
            "name": "Greg Gaines",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0037254",
        "name": "Terrel Bernard",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037254",
            "name": "Terrel Bernard",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034832",
            "name": "Bradley Chubb",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038557",
            "name": "Dorian Williams",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036914",
            "name": "Greg Rousseau",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035933",
            "name": "Michael Hoecht",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041444",
            "name": "Kaleb Elarms-Orr",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039763",
            "name": "Joe Andreessen",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041036",
            "name": "TJ Parker",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039879",
            "name": "Javon Solomon",
            "posAbb": "SLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036378",
            "name": "Mike Danna",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0034832",
        "name": "Bradley Chubb",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037254",
            "name": "Terrel Bernard",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034832",
            "name": "Bradley Chubb",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038557",
            "name": "Dorian Williams",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036914",
            "name": "Greg Rousseau",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035933",
            "name": "Michael Hoecht",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041444",
            "name": "Kaleb Elarms-Orr",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039763",
            "name": "Joe Andreessen",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041036",
            "name": "TJ Parker",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039879",
            "name": "Javon Solomon",
            "posAbb": "SLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036378",
            "name": "Mike Danna",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037288",
        "name": "Christian Benford",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037288",
            "name": "Christian Benford",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040709",
            "name": "Maxwell Hairston",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041391",
            "name": "Davison Igbinosun",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040197",
            "name": "Dorian Strong",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0040709",
        "name": "Maxwell Hairston",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037288",
            "name": "Christian Benford",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040709",
            "name": "Maxwell Hairston",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041391",
            "name": "Davison Igbinosun",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040197",
            "name": "Dorian Strong",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0037034",
        "name": "Dee Alford",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037034",
            "name": "Dee Alford",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040192",
            "name": "Jordan Hancock",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0035253",
        "name": "C.J. Gardner-Johnson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035253",
            "name": "C.J. Gardner-Johnson",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036037",
            "name": "Sam Franklin Jr.",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0039872",
        "name": "Cole Bishop",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039872",
            "name": "Cole Bishop",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036888",
            "name": "Damar Hamlin",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041086",
            "name": "Jalon Kilgore",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "CAR": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0039150",
        "name": "Bryce Young",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039150",
            "name": "Bryce Young",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038102",
            "name": "Kenny Pickett",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041149",
            "name": "Haynes King",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0036555",
        "name": "Chuba Hubbard",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036555",
            "name": "Chuba Hubbard",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039344",
            "name": "Jonathon Brooks",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036265",
            "name": "AJ Dillon",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0039344",
        "name": "Jonathon Brooks",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036555",
            "name": "Chuba Hubbard",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039344",
            "name": "Jonathon Brooks",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036265",
            "name": "AJ Dillon",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0040124",
        "name": "Tetairoa McMillan",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040124",
            "name": "Tetairoa McMillan",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039491",
            "name": "Jalen Coker",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039342",
            "name": "Xavier Legette",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039491",
        "name": "Jalen Coker",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040124",
            "name": "Tetairoa McMillan",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039491",
            "name": "Jalen Coker",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039342",
            "name": "Xavier Legette",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0039342",
        "name": "Xavier Legette",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040124",
            "name": "Tetairoa McMillan",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039491",
            "name": "Jalen Coker",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039342",
            "name": "Xavier Legette",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0037005",
        "name": "Tommy Tremble",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037005",
            "name": "Tommy Tremble",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040187",
            "name": "Mitchell Evans",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0031610",
            "name": "Darren Waller",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0037196",
        "name": "Rasheed Walker",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037196",
            "name": "Rasheed Walker",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036653",
            "name": "Stone Forsythe",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041138",
            "name": "Albert Reese IV",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0036417",
        "name": "Damien Lewis",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036417",
            "name": "Damien Lewis",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039242",
            "name": "Corey Bullock",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0037814",
        "name": "Luke Fortner",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037814",
            "name": "Luke Fortner",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041071",
            "name": "Sam Hecht",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036325",
        "name": "Robert Hunt",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036325",
            "name": "Robert Hunt",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039242",
            "name": "Corey Bullock",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036968",
            "name": "Brady Christensen",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0041034",
        "name": "Monroe Freeling",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041034",
            "name": "Monroe Freeling",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036653",
            "name": "Stone Forsythe",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041138",
            "name": "Albert Reese IV",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0036220",
        "name": "Derrick Brown",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036220",
            "name": "Derrick Brown",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036903",
            "name": "Bobby Brown III",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041148",
            "name": "Aaron Hall",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040458",
            "name": "TeRah Edwards",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035890",
            "name": "Tershawn Wharton",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0041148",
        "name": "Aaron Hall",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Bobby Brown III (Out)",
        "candidates": [
          {
            "gsis_id": "00-0036220",
            "name": "Derrick Brown",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036903",
            "name": "Bobby Brown III",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041148",
            "name": "Aaron Hall",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040458",
            "name": "TeRah Edwards",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035890",
            "name": "Tershawn Wharton",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0041478",
        "name": "Lee Hunter",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041478",
            "name": "Lee Hunter",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040174",
            "name": "Cam Jackson",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0037244",
        "name": "Devin Lloyd",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037244",
            "name": "Devin Lloyd",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035687",
            "name": "Bobby Okereke",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036934",
            "name": "Jaelan Phillips",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037007",
            "name": "Patrick Jones II",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036305",
            "name": "Trevis Gipson",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040136",
            "name": "Princely Umanmielen",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038493",
            "name": "Claudin Cherelus",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035352",
            "name": "Tyrel Dodson",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038791",
            "name": "Thomas Incoom",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041119",
            "name": "Jackson Kuwatch",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036356",
            "name": "Isaiah Simmons",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0035687",
        "name": "Bobby Okereke",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037244",
            "name": "Devin Lloyd",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035687",
            "name": "Bobby Okereke",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036934",
            "name": "Jaelan Phillips",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037007",
            "name": "Patrick Jones II",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036305",
            "name": "Trevis Gipson",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040136",
            "name": "Princely Umanmielen",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038493",
            "name": "Claudin Cherelus",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035352",
            "name": "Tyrel Dodson",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038791",
            "name": "Thomas Incoom",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041119",
            "name": "Jackson Kuwatch",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036356",
            "name": "Isaiah Simmons",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0036944",
        "name": "Jaycee Horn",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036944",
            "name": "Jaycee Horn",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035277",
            "name": "Mike Jackson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038101",
            "name": "Akayleb Evans",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041063",
            "name": "Will Lee III",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0035277",
        "name": "Mike Jackson",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036944",
            "name": "Jaycee Horn",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035277",
            "name": "Mike Jackson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038101",
            "name": "Akayleb Evans",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041063",
            "name": "Will Lee III",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039380",
        "name": "Chau Smith-Wade",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039380",
            "name": "Chau Smith-Wade",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0035669",
        "name": "Nick Scott",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035669",
            "name": "Nick Scott",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040159",
            "name": "Lathan Ransom",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0036962",
        "name": "Tre'von Moehrig",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036962",
            "name": "Tre'von Moehrig",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041076",
            "name": "Zakee Wheatley",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "CHI": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0039918",
        "name": "Caleb Williams",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039918",
            "name": "Caleb Williams",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038416",
            "name": "Tyson Bagent",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0028986",
            "name": "Case Keenum",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0036275",
        "name": "D'Andre Swift",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036275",
            "name": "D'Andre Swift",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040236",
            "name": "Kyle Monangai",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039021",
            "name": "Roschon Johnson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0040236",
        "name": "Kyle Monangai",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036275",
            "name": "D'Andre Swift",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040236",
            "name": "Kyle Monangai",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039021",
            "name": "Roschon Johnson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0039919",
        "name": "Rome Odunze",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039919",
            "name": "Rome Odunze",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040735",
            "name": "Luther Burden III",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032464",
            "name": "Kalif Raymond",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0040735",
        "name": "Luther Burden III",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039919",
            "name": "Rome Odunze",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040735",
            "name": "Luther Burden III",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032464",
            "name": "Kalif Raymond",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0032464",
        "name": "Kalif Raymond",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039919",
            "name": "Rome Odunze",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040735",
            "name": "Luther Burden III",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032464",
            "name": "Kalif Raymond",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0040126",
        "name": "Colston Loveland",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040126",
            "name": "Colston Loveland",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036290",
            "name": "Cole Kmet",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041558",
            "name": "Sam Roush",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0037081",
        "name": "Braxton Jones",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037081",
            "name": "Braxton Jones",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040740",
            "name": "Ozzy Trapilo",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039459",
            "name": "Theo Benedet",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0032391",
        "name": "Joe Thuney",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032391",
            "name": "Joe Thuney",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038595",
            "name": "Jordan McFadden",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0035588",
        "name": "Garrett Bradbury",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035588",
            "name": "Garrett Bradbury",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041539",
            "name": "Logan Jones",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036258",
        "name": "Jonah Jackson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036258",
            "name": "Jonah Jackson",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040210",
            "name": "Luke Newman",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0038932",
        "name": "Darnell Wright",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038932",
            "name": "Darnell Wright",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039459",
            "name": "Theo Benedet",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0035647",
        "name": "Montez Sweat",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035647",
            "name": "Montez Sweat",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036480",
            "name": "Dayo Odeyingbo",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039840",
            "name": "Austin Booker",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037843",
            "name": "Daniel Hardy",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039461",
            "name": "Jamree Kromah",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036239",
            "name": "Jonathan Garvin",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0036480",
        "name": "Dayo Odeyingbo",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035647",
            "name": "Montez Sweat",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036480",
            "name": "Dayo Odeyingbo",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039840",
            "name": "Austin Booker",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037843",
            "name": "Daniel Hardy",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039461",
            "name": "Jamree Kromah",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036239",
            "name": "Jonathan Garvin",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0031583",
        "name": "Grady Jarrett",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031583",
            "name": "Grady Jarrett",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034320",
            "name": "Kentavius Street",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036366",
            "name": "Neville Gallimore",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041110",
            "name": "Jordan van den Berg",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036337",
            "name": "James Lynch",
            "posAbb": "LDT",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041171",
            "name": "Jayden Loving",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0035386",
        "name": "T.J. Edwards",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035386",
            "name": "T.J. Edwards",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037271",
            "name": "D'Marco Jackson",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035525",
            "name": "Devin Bush",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036634",
            "name": "Tony Fields II",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041085",
            "name": "Keyshaun Elliott",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037109",
            "name": "Jack Sanborn",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037544",
            "name": "Nephi Sewell",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038390",
            "name": "Noah Sewell",
            "posAbb": "MLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0037271",
        "name": "D'Marco Jackson",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035386",
            "name": "T.J. Edwards",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037271",
            "name": "D'Marco Jackson",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035525",
            "name": "Devin Bush",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036634",
            "name": "Tony Fields II",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041085",
            "name": "Keyshaun Elliott",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037109",
            "name": "Jack Sanborn",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037544",
            "name": "Nephi Sewell",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038390",
            "name": "Noah Sewell",
            "posAbb": "MLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0036292",
        "name": "Jaylon Johnson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036292",
            "name": "Jaylon Johnson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039071",
            "name": "Tyrique Stevenson",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037129",
            "name": "Josh Blackwell",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038568",
            "name": "Clark Phillips III",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037395",
            "name": "Dallis Flowers",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0039071",
        "name": "Tyrique Stevenson",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036292",
            "name": "Jaylon Johnson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039071",
            "name": "Tyrique Stevenson",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037129",
            "name": "Josh Blackwell",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038568",
            "name": "Clark Phillips III",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037395",
            "name": "Dallis Flowers",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0035357",
        "name": "Cam Lewis",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035357",
            "name": "Cam Lewis",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041060",
            "name": "Malik Muhammad",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038111",
            "name": "Kyler Gordon",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0033579",
        "name": "Xavier Woods",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033579",
            "name": "Xavier Woods",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041175",
            "name": "Skyler Thomas",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038136",
            "name": "Coby Bryant",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0041538",
        "name": "Dillon Thieneman",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041538",
            "name": "Dillon Thieneman",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037096",
            "name": "Elijah Hicks",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "CIN": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0036442",
        "name": "Joe Burrow",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036442",
            "name": "Joe Burrow",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0026158",
            "name": "Joe Flacco",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0026300",
            "name": "Josh Johnson",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0038597",
        "name": "Chase Brown",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038597",
            "name": "Chase Brown",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033526",
            "name": "Samaje Perine",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040208",
            "name": "Tahj Brooks",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0033526",
        "name": "Samaje Perine",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038597",
            "name": "Chase Brown",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033526",
            "name": "Samaje Perine",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040208",
            "name": "Tahj Brooks",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036900",
        "name": "Ja'Marr Chase",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036900",
            "name": "Ja'Marr Chase",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036410",
            "name": "Tee Higgins",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038619",
            "name": "Andrei Iosivas",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0036410",
        "name": "Tee Higgins",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036900",
            "name": "Ja'Marr Chase",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036410",
            "name": "Tee Higgins",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038619",
            "name": "Andrei Iosivas",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0038619",
        "name": "Andrei Iosivas",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036900",
            "name": "Ja'Marr Chase",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036410",
            "name": "Tee Higgins",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038619",
            "name": "Andrei Iosivas",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0034829",
        "name": "Mike Gesicki",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034829",
            "name": "Mike Gesicki",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035631",
            "name": "Drew Sample",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039814",
            "name": "Erick All Jr.",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0034752",
        "name": "Orlando Brown Jr.",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034752",
            "name": "Orlando Brown Jr.",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039742",
            "name": "Javon Foster",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0040140",
        "name": "Dylan Fairchild",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040140",
            "name": "Dylan Fairchild",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040180",
            "name": "Jalen Rivers",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041098",
            "name": "Brian Parker II",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0032445",
        "name": "Ted Karras",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032445",
            "name": "Ted Karras",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041062",
            "name": "Connor Lew",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040359",
            "name": "Jacob Bayer",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0035702",
        "name": "Dalton Risner",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035702",
            "name": "Dalton Risner",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040359",
            "name": "Jacob Bayer",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0039925",
        "name": "Amarius Mims",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039925",
            "name": "Amarius Mims",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040015",
            "name": "Myles Hinton",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0038133",
        "name": "Boye Mafe",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038133",
            "name": "Boye Mafe",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038546",
            "name": "Myles Murphy",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041546",
            "name": "Cashius Howell",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040756",
            "name": "Shemar Stewart",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039752",
            "name": "Cedric Johnson",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0038546",
        "name": "Myles Murphy",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038133",
            "name": "Boye Mafe",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038546",
            "name": "Myles Murphy",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041546",
            "name": "Cashius Howell",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040756",
            "name": "Shemar Stewart",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039752",
            "name": "Cedric Johnson",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0033523",
        "name": "Jonathan Allen",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033523",
            "name": "Jonathan Allen",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035683",
            "name": "Dexter Lawrence II",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034800",
            "name": "B.J. Hill",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036642",
            "name": "T.J. Slaton Jr.",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039908",
            "name": "Kris Jenkins Jr.",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0040157",
        "name": "Barrett Carter",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040157",
            "name": "Barrett Carter",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034754",
            "name": "Oren Burks",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040738",
            "name": "Demetrius Knight Jr.",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035363",
            "name": "Joe Giles-Harris",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039313",
            "name": "Swayze Bozeman",
            "posAbb": "SLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0034754",
        "name": "Oren Burks",
        "grade": "Average",
        "rating": 70,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040157",
            "name": "Barrett Carter",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034754",
            "name": "Oren Burks",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040738",
            "name": "Demetrius Knight Jr.",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035363",
            "name": "Joe Giles-Harris",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039313",
            "name": "Swayze Bozeman",
            "posAbb": "SLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037743",
        "name": "Dax Hill",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037743",
            "name": "Dax Hill",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038549",
            "name": "DJ Turner II",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038642",
            "name": "DJ Ivey",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041464",
            "name": "Tacario Davis",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0038549",
        "name": "DJ Turner II",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037743",
            "name": "Dax Hill",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038549",
            "name": "DJ Turner II",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038642",
            "name": "DJ Ivey",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041464",
            "name": "Tacario Davis",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0034446",
        "name": "Jalen Davis",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034446",
            "name": "Jalen Davis",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039375",
            "name": "Josh Newton",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037307",
            "name": "Ja'Sir Taylor",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0037193",
        "name": "Bryan Cook",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037193",
            "name": "Bryan Cook",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039632",
            "name": "PJ Jules",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0038560",
        "name": "Jordan Battle",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038560",
            "name": "Jordan Battle",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036231",
            "name": "Kyle Dugger",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "CLE": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0033537",
        "name": "Deshaun Watson",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033537",
            "name": "Deshaun Watson",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040668",
            "name": "Shedeur Sanders",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041092",
            "name": "Taylen Green",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0040784",
        "name": "Quinshon Judkins",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040784",
            "name": "Quinshon Judkins",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031595",
            "name": "Michael Burton",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040466",
            "name": "Raheim Sanders",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038794",
            "name": "Jaleel McLaughlin",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0031595",
        "name": "Michael Burton",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040784",
            "name": "Quinshon Judkins",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031595",
            "name": "Michael Burton",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040466",
            "name": "Raheim Sanders",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038794",
            "name": "Jaleel McLaughlin",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036407",
        "name": "Jerry Jeudy",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036407",
            "name": "Jerry Jeudy",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041547",
            "name": "KC Concepcion",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041037",
            "name": "Denzel Boston",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0041547",
        "name": "KC Concepcion",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036407",
            "name": "Jerry Jeudy",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041547",
            "name": "KC Concepcion",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041037",
            "name": "Denzel Boston",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0041037",
        "name": "Denzel Boston",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036407",
            "name": "Jerry Jeudy",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041547",
            "name": "KC Concepcion",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041037",
            "name": "Denzel Boston",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0040663",
        "name": "Harold Fannin Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040663",
            "name": "Harold Fannin Jr.",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038710",
            "name": "Blake Whiteheart",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041131",
            "name": "Carsen Ryan",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0041030",
        "name": "Spencer Fano",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041030",
            "name": "Spencer Fano",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039014",
            "name": "Dawand Jones",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0037818",
        "name": "Zion Johnson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037818",
            "name": "Zion Johnson",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039350",
            "name": "Zak Zinter",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036983",
            "name": "Kendrick Green",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0035526",
        "name": "Elgton Jenkins",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035526",
            "name": "Elgton Jenkins",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041073",
            "name": "Parker Brailsford",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038609",
            "name": "Luke Wypler",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036953",
        "name": "Teven Jenkins",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036953",
            "name": "Teven Jenkins",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041049",
            "name": "Austin Barber",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0035234",
        "name": "Tytus Howard",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035234",
            "name": "Tytus Howard",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041049",
            "name": "Austin Barber",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0038574",
        "name": "Isaiah McGuire",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038574",
            "name": "Isaiah McGuire",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039852",
            "name": "Jared Verse",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037665",
            "name": "Sam Williams",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033876",
            "name": "Derek Barnett",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037251",
            "name": "Alex Wright",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0039852",
        "name": "Jared Verse",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038574",
            "name": "Isaiah McGuire",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039852",
            "name": "Jared Verse",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037665",
            "name": "Sam Williams",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033876",
            "name": "Derek Barnett",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037251",
            "name": "Alex Wright",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0040685",
        "name": "Mason Graham",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040685",
            "name": "Mason Graham",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033131",
            "name": "Maliek Collins",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040255",
            "name": "Adin Huntington",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039895",
            "name": "Mike Hall Jr.",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037832",
            "name": "Kalia Davis",
            "posAbb": "LDT",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039764",
            "name": "Elijah Chatman",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0040579",
        "name": "Carson Schwesinger",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040579",
            "name": "Carson Schwesinger",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035680",
            "name": "Quincy Williams",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040261",
            "name": "Easton Mascarenas-Arnold",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039515",
            "name": "Winston Reid",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039406",
            "name": "Nathaniel Watson",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041075",
            "name": "Justin Jefferson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036915",
            "name": "Jeremiah Owusu-Koramoah",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039878",
            "name": "Edefuan Ulofoshio",
            "posAbb": "MLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0035680",
        "name": "Quincy Williams",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040579",
            "name": "Carson Schwesinger",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035680",
            "name": "Quincy Williams",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040261",
            "name": "Easton Mascarenas-Arnold",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039515",
            "name": "Winston Reid",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039406",
            "name": "Nathaniel Watson",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041075",
            "name": "Justin Jefferson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036915",
            "name": "Jeremiah Owusu-Koramoah",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039878",
            "name": "Edefuan Ulofoshio",
            "posAbb": "MLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0034856",
        "name": "Denzel Ward",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034856",
            "name": "Denzel Ward",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036974",
            "name": "Tyson Campbell",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041115",
            "name": "Toriano Pride Jr.",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038565",
            "name": "Mekhi Blackmon",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038105",
            "name": "Damarri Mathis",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0036974",
        "name": "Tyson Campbell",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034856",
            "name": "Denzel Ward",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036974",
            "name": "Tyson Campbell",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041115",
            "name": "Toriano Pride Jr.",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038565",
            "name": "Mekhi Blackmon",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038105",
            "name": "Damarri Mathis",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039417",
        "name": "Myles Harden",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039417",
            "name": "Myles Harden",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036287",
            "name": "Noah Igbinoghene",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0038715",
        "name": "Ronnie Hickman",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038715",
            "name": "Ronnie Hickman",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040263",
            "name": "Donovan McMillon",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0036282",
        "name": "Grant Delpit",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036282",
            "name": "Grant Delpit",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041471",
            "name": "Emmanuel McNeil-Warren",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036306",
            "name": "Daniel Thomas",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "DAL": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0033077",
        "name": "Dak Prescott",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033077",
            "name": "Dak Prescott",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037077",
            "name": "Sam Howell",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0036997",
        "name": "Javonte Williams",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036997",
            "name": "Javonte Williams",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038738",
            "name": "Hunter Luepke",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038705",
            "name": "Emari Demercado",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037120",
            "name": "Tyler Goodson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0038738",
        "name": "Hunter Luepke",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036997",
            "name": "Javonte Williams",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038738",
            "name": "Hunter Luepke",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038705",
            "name": "Emari Demercado",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037120",
            "name": "Tyler Goodson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036358",
        "name": "CeeDee Lamb",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036358",
            "name": "CeeDee Lamb",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037247",
            "name": "George Pickens",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039410",
            "name": "Ryan Flournoy",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0037247",
        "name": "George Pickens",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036358",
            "name": "CeeDee Lamb",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037247",
            "name": "George Pickens",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039410",
            "name": "Ryan Flournoy",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0039410",
        "name": "Ryan Flournoy",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036358",
            "name": "CeeDee Lamb",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037247",
            "name": "George Pickens",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039410",
            "name": "Ryan Flournoy",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0038041",
        "name": "Jake Ferguson",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038041",
            "name": "Jake Ferguson",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039530",
            "name": "Brevyn Spann-Ford",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038547",
            "name": "Luke Schoonmaker",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0039341",
        "name": "Tyler Guyton",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039341",
            "name": "Tyler Guyton",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040874",
            "name": "Drew Shelton",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0038731",
        "name": "T.J. Bass",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038731",
            "name": "T.J. Bass",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037243",
            "name": "Tyler Smith",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0039348",
        "name": "Cooper Beebe",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039348",
            "name": "Cooper Beebe",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036105",
            "name": "Nick Leverett",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036295",
            "name": "Matt Hennessy",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0040007",
        "name": "Tyler Booker",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040007",
            "name": "Tyler Booker",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040017",
            "name": "Ajani Cornelius",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0036036",
        "name": "Terence Steele",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036036",
            "name": "Terence Steele",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039109",
            "name": "Broderick Jones",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0035718",
        "name": "Quinnen Williams",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035718",
            "name": "Quinnen Williams",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033120",
            "name": "Kenny Clark",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040880",
            "name": "LT Overton",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040933",
            "name": "Kelvin Gilliam Jr.",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0033120",
        "name": "Kenny Clark",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035718",
            "name": "Quinnen Williams",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033120",
            "name": "Kenny Clark",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040880",
            "name": "LT Overton",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040933",
            "name": "Kelvin Gilliam Jr.",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0037270",
        "name": "Otito Ogbonnia",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037270",
            "name": "Otito Ogbonnia",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033093",
            "name": "Jonathan Bullard",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0040725",
        "name": "Donovan Ezeiruaku",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: DeMarvion Overshown (Out)",
        "candidates": [
          {
            "gsis_id": "00-0038556",
            "name": "DeMarvion Overshown",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040725",
            "name": "Donovan Ezeiruaku",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034967",
            "name": "Rashan Gary",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038625",
            "name": "Dee Winters",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040872",
            "name": "Jaishawn Barham",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041537",
            "name": "Malachi Lawrence",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0027940",
            "name": "Von Miller",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040011",
            "name": "Shemar James",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037310",
            "name": "James Houston",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036728",
            "name": "Curtis Robinson",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040043",
            "name": "Justin Barron",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038742",
            "name": "Tyrus Wheat",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0034967",
        "name": "Rashan Gary",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038556",
            "name": "DeMarvion Overshown",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040725",
            "name": "Donovan Ezeiruaku",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034967",
            "name": "Rashan Gary",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038625",
            "name": "Dee Winters",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040872",
            "name": "Jaishawn Barham",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041537",
            "name": "Malachi Lawrence",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0027940",
            "name": "Von Miller",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040011",
            "name": "Shemar James",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037310",
            "name": "James Houston",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036728",
            "name": "Curtis Robinson",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040043",
            "name": "Justin Barron",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038742",
            "name": "Tyrus Wheat",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037275",
        "name": "DaRon Bland",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037275",
            "name": "DaRon Bland",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037839",
            "name": "Cobie Durant",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040008",
            "name": "Shavon Revel Jr.",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039387",
            "name": "Caelen Carson",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038624",
            "name": "Ameer Speed",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0037839",
        "name": "Cobie Durant",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037275",
            "name": "DaRon Bland",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037839",
            "name": "Cobie Durant",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040008",
            "name": "Shavon Revel Jr.",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039387",
            "name": "Caelen Carson",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038624",
            "name": "Ameer Speed",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0040865",
        "name": "Caleb Downs",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040865",
            "name": "Caleb Downs",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0035227",
        "name": "P.J. Locke",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Malik Hooker (Out)",
        "candidates": [
          {
            "gsis_id": "00-0033877",
            "name": "Malik Hooker",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035227",
            "name": "P.J. Locke",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0035705",
        "name": "Jalen Thompson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035705",
            "name": "Jalen Thompson",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037561",
            "name": "Markquese Bell",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040045",
            "name": "Alijah Clark",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "DEN": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0039732",
        "name": "Bo Nix",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039732",
            "name": "Bo Nix",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035264",
            "name": "Jarrett Stidham",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036879",
            "name": "Sam Ehlinger",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0036158",
        "name": "J.K. Dobbins",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036158",
            "name": "J.K. Dobbins",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036727",
            "name": "Adam Prentice",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040730",
            "name": "RJ Harvey",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041496",
            "name": "Jonah Coleman",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0036727",
        "name": "Adam Prentice",
        "grade": "Average",
        "rating": 70,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036158",
            "name": "J.K. Dobbins",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036727",
            "name": "Adam Prentice",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040730",
            "name": "RJ Harvey",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041496",
            "name": "Jonah Coleman",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036613",
        "name": "Jaylen Waddle",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036613",
            "name": "Jaylen Waddle",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034348",
            "name": "Courtland Sutton",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038976",
            "name": "Marvin Mims Jr.",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0034348",
        "name": "Courtland Sutton",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036613",
            "name": "Jaylen Waddle",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034348",
            "name": "Courtland Sutton",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038976",
            "name": "Marvin Mims Jr.",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0033881",
        "name": "Evan Engram",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033881",
            "name": "Evan Engram",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036422",
            "name": "Adam Trautman",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038783",
            "name": "Nate Adkins",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0033538",
        "name": "Garett Bolles",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033538",
            "name": "Garett Bolles",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036392",
            "name": "Matt Peart",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039568",
            "name": "Frank Crum",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0034978",
        "name": "Ben Powers",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034978",
            "name": "Ben Powers",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041498",
            "name": "Kage Casey",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039438",
            "name": "Nick Gargiulo",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0037278",
        "name": "Luke Wattenberg",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037278",
            "name": "Luke Wattenberg",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038649",
            "name": "Alex Forsyth",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035686",
            "name": "Michael Deiter",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0037001",
        "name": "Quinn Meinerz",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037001",
            "name": "Quinn Meinerz",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041498",
            "name": "Kage Casey",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0034847",
        "name": "Mike McGlinchey",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034847",
            "name": "Mike McGlinchey",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038796",
            "name": "Alex Palczewski",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0035248",
        "name": "Zach Allen",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035248",
            "name": "Zach Allen",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038106",
            "name": "Eyioma Uwazurike",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035763",
            "name": "Malcolm Roach",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037294",
            "name": "Jordan Jackson",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041552",
            "name": "Tyler Onyedim",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0038106",
        "name": "Eyioma Uwazurike",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035248",
            "name": "Zach Allen",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038106",
            "name": "Eyioma Uwazurike",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035763",
            "name": "Malcolm Roach",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037294",
            "name": "Jordan Jackson",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041552",
            "name": "Tyler Onyedim",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0033297",
        "name": "D.J. Jones",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033297",
            "name": "D.J. Jones",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040153",
            "name": "Sai'vion Jones",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0031898",
        "name": "Alex Singleton",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031898",
            "name": "Alex Singleton",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036428",
            "name": "Justin Strnad",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039809",
            "name": "Jonah Elliss",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037249",
            "name": "Nik Bonitto",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037799",
            "name": "Dondrea Tillman",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040634",
            "name": "Jordan Turner",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040449",
            "name": "Karene Reid",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040168",
            "name": "Que Robinson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036952",
            "name": "Jonathon Cooper",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039565",
            "name": "Levelle Bailey",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0036428",
        "name": "Justin Strnad",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031898",
            "name": "Alex Singleton",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036428",
            "name": "Justin Strnad",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039809",
            "name": "Jonah Elliss",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037249",
            "name": "Nik Bonitto",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037799",
            "name": "Dondrea Tillman",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040634",
            "name": "Jordan Turner",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040449",
            "name": "Karene Reid",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040168",
            "name": "Que Robinson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036952",
            "name": "Jonathon Cooper",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039565",
            "name": "Levelle Bailey",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0038552",
        "name": "Riley Moss",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038552",
            "name": "Riley Moss",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036874",
            "name": "Pat Surtain II",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040720",
            "name": "Jahdae Barron",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039371",
            "name": "Kris Abrams-Draine",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0036874",
        "name": "Pat Surtain II",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038552",
            "name": "Riley Moss",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036874",
            "name": "Pat Surtain II",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040720",
            "name": "Jahdae Barron",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039371",
            "name": "Kris Abrams-Draine",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0037384",
        "name": "Ja'Quan McMillian",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037384",
            "name": "Ja'Quan McMillian",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040720",
            "name": "Jahdae Barron",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036221",
        "name": "Brandon Jones",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036221",
            "name": "Brandon Jones",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036683",
            "name": "Devon Key",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0036564",
        "name": "Talanoa Hufanga",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036564",
            "name": "Talanoa Hufanga",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038605",
            "name": "JL Skinner",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037752",
            "name": "Tycen Anderson",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "DET": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0033106",
        "name": "Jared Goff",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033106",
            "name": "Jared Goff",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033949",
            "name": "Joshua Dobbs",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0039139",
        "name": "Jahmyr Gibbs",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039139",
            "name": "Jahmyr Gibbs",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039364",
            "name": "Sione Vaki",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038896",
            "name": "Jacob Saylors",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0039364",
        "name": "Sione Vaki",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039139",
            "name": "Jahmyr Gibbs",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039364",
            "name": "Sione Vaki",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038896",
            "name": "Jacob Saylors",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036963",
        "name": "Amon-Ra St. Brown",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036963",
            "name": "Amon-Ra St. Brown",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037240",
            "name": "Jameson Williams",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040669",
            "name": "Isaac TeSlaa",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0037240",
        "name": "Jameson Williams",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036963",
            "name": "Amon-Ra St. Brown",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037240",
            "name": "Jameson Williams",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040669",
            "name": "Isaac TeSlaa",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0040669",
        "name": "Isaac TeSlaa",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036963",
            "name": "Amon-Ra St. Brown",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037240",
            "name": "Jameson Williams",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040669",
            "name": "Isaac TeSlaa",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0039065",
        "name": "Sam LaPorta",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039065",
            "name": "Sam LaPorta",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036754",
            "name": "Brock Wright",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034270",
            "name": "Tyler Conklin",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0036880",
        "name": "Penei Sewell",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036880",
            "name": "Penei Sewell",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039362",
            "name": "Giovanni Manu",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0039408",
        "name": "Christian Mahogany",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039408",
            "name": "Christian Mahogany",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036272",
            "name": "Ben Bartch",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0038936",
        "name": "Juice Scruggs",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038936",
            "name": "Juice Scruggs",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037297",
            "name": "Cade Mays",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0040728",
        "name": "Tate Ratledge",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040728",
            "name": "Tate Ratledge",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040193",
            "name": "Miles Frazier",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0036905",
        "name": "Larry Borom",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036905",
            "name": "Larry Borom",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0011237",
            "name": "Blake Miller",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0037236",
        "name": "Aidan Hutchinson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037236",
            "name": "Aidan Hutchinson",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038940",
            "name": "Tyler Lacy",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041441",
            "name": "Derrick Moore",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036335",
            "name": "DJ Wonnum",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038660",
            "name": "Trevor Nowaske",
            "posAbb": "RDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041459",
            "name": "Eric O'Neill",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0038940",
        "name": "Tyler Lacy",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037236",
            "name": "Aidan Hutchinson",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038940",
            "name": "Tyler Lacy",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041441",
            "name": "Derrick Moore",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036335",
            "name": "DJ Wonnum",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038660",
            "name": "Trevor Nowaske",
            "posAbb": "RDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041459",
            "name": "Eric O'Neill",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0036624",
        "name": "Alim McNeill",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036624",
            "name": "Alim McNeill",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040672",
            "name": "Tyleik Williams",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036954",
            "name": "Levi Onwuzurike",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039396",
            "name": "Mekhi Wingo",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041447",
            "name": "Skyler Gill-Howard",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0039018",
        "name": "Jack Campbell",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039018",
            "name": "Jack Campbell",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036964",
            "name": "Derrick Barnes",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035707",
            "name": "Devin White",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037289",
            "name": "Malcolm Rodriguez",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035895",
            "name": "Joe Bachie",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037281",
            "name": "Damone Clark",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041442",
            "name": "Jimmy Rolder",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0036964",
        "name": "Derrick Barnes",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039018",
            "name": "Jack Campbell",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036964",
            "name": "Derrick Barnes",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035707",
            "name": "Devin White",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037289",
            "name": "Malcolm Rodriguez",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035895",
            "name": "Joe Bachie",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037281",
            "name": "Damone Clark",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041442",
            "name": "Jimmy Rolder",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0034384",
        "name": "D.J. Reed",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034384",
            "name": "D.J. Reed",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035637",
            "name": "Rock Ya-Sin",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036124",
            "name": "Khalil Dorsey",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041445",
            "name": "Keith Abney II",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0035637",
        "name": "Rock Ya-Sin",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034384",
            "name": "D.J. Reed",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035637",
            "name": "Rock Ya-Sin",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036124",
            "name": "Khalil Dorsey",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041445",
            "name": "Keith Abney II",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0038820",
        "name": "Christian Izien",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038820",
            "name": "Christian Izien",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038125",
            "name": "Roger McCreary",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039862",
            "name": "Ennis Rakestraw Jr.",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0033294",
        "name": "Chuck Clark",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033294",
            "name": "Chuck Clark",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039660",
            "name": "Thomas Harper",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037667",
            "name": "Kerby Joseph",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0034377",
        "name": "Avonte Maddox",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034377",
            "name": "Avonte Maddox",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039141",
            "name": "Brian Branch",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "GB": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0036264",
        "name": "Jordan Love",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036264",
            "name": "Jordan Love",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0028118",
            "name": "Tyrod Taylor",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0039811",
        "name": "MarShawn Lloyd",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039811",
            "name": "MarShawn Lloyd",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038685",
            "name": "Chris Brooks",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040142",
            "name": "Kaleb Johnson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0038685",
        "name": "Chris Brooks",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039811",
            "name": "MarShawn Lloyd",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038685",
            "name": "Chris Brooks",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040142",
            "name": "Kaleb Johnson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0038124",
        "name": "Christian Watson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038124",
            "name": "Christian Watson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039146",
            "name": "Jayden Reed",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040667",
            "name": "Matthew Golden",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039146",
        "name": "Jayden Reed",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038124",
            "name": "Christian Watson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039146",
            "name": "Jayden Reed",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040667",
            "name": "Matthew Golden",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0040667",
        "name": "Matthew Golden",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038124",
            "name": "Christian Watson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039146",
            "name": "Jayden Reed",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040667",
            "name": "Matthew Golden",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0038996",
        "name": "Tucker Kraft",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038996",
            "name": "Tucker Kraft",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033858",
            "name": "Jonnu Smith",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038589",
            "name": "Josh Whyle",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0039904",
        "name": "Jordan Morgan",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039904",
            "name": "Jordan Morgan",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040023",
            "name": "John Williams",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0036551",
        "name": "Aaron Banks",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036551",
            "name": "Aaron Banks",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039272",
            "name": "Donovan Jennings",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040884",
            "name": "Jager Burton",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0037076",
        "name": "Sean Rhyan",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037076",
            "name": "Sean Rhyan",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040884",
            "name": "Jager Burton",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039817",
        "name": "Jacob Monk",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039817",
            "name": "Jacob Monk",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039272",
            "name": "Donovan Jennings",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040726",
            "name": "Anthony Belton",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0037817",
        "name": "Zach Bako-Bewele",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037817",
            "name": "Zach Bako-Bewele",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040726",
            "name": "Anthony Belton",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039819",
            "name": "Travis Glover",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0038398",
        "name": "Karl Brooks",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038398",
            "name": "Karl Brooks",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037075",
            "name": "Devonte Wyatt",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040689",
            "name": "Anthony Campbell",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040016",
            "name": "Warren Brinson",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040869",
            "name": "Chris McClellan",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0037075",
        "name": "Devonte Wyatt",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038398",
            "name": "Karl Brooks",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037075",
            "name": "Devonte Wyatt",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040689",
            "name": "Anthony Campbell",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040016",
            "name": "Warren Brinson",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040869",
            "name": "Chris McClellan",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0037094",
        "name": "Jonathan Ford",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Javon Hargrave (Out)",
        "candidates": [
          {
            "gsis_id": "00-0033109",
            "name": "Javon Hargrave",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037094",
            "name": "Jonathan Ford",
            "posAbb": "NT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038506",
            "name": "Jordon Riley",
            "posAbb": "NT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0039850",
        "name": "Edgerrin Cooper",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039850",
            "name": "Edgerrin Cooper",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034431",
            "name": "Zaire Franklin",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039112",
            "name": "Lukas Van Ness",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040010",
            "name": "Barryn Sorrell",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036658",
            "name": "Isaiah McDuffie",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038463",
            "name": "Brenton Cox Jr.",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039812",
            "name": "Ty'Ron Hopper",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036932",
            "name": "Micah Parsons",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040877",
            "name": "Dani Dennis-Sutton",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036648",
            "name": "Nick Niemann",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040012",
            "name": "Collin Oliver",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0034431",
        "name": "Zaire Franklin",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039850",
            "name": "Edgerrin Cooper",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034431",
            "name": "Zaire Franklin",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039112",
            "name": "Lukas Van Ness",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040010",
            "name": "Barryn Sorrell",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036658",
            "name": "Isaiah McDuffie",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038463",
            "name": "Brenton Cox Jr.",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039812",
            "name": "Ty'Ron Hopper",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036932",
            "name": "Micah Parsons",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040877",
            "name": "Dani Dennis-Sutton",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036648",
            "name": "Nick Niemann",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040012",
            "name": "Collin Oliver",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0035133",
        "name": "Keisean Nixon",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035133",
            "name": "Keisean Nixon",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041470",
            "name": "Brandon Cisse",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038408",
            "name": "Carrington Valentine",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036625",
            "name": "Benjamin St-Juste",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0008818",
            "name": "Marlon Jones",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0041470",
        "name": "Brandon Cisse",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035133",
            "name": "Keisean Nixon",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041470",
            "name": "Brandon Cisse",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038408",
            "name": "Carrington Valentine",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036625",
            "name": "Benjamin St-Juste",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0008818",
            "name": "Marlon Jones",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039867",
        "name": "Javon Bullard",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039867",
            "name": "Javon Bullard",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039831",
            "name": "Kamal Hadden",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036388",
        "name": "Xavier McKinney",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036388",
            "name": "Xavier McKinney",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039818",
            "name": "Kitan Oladapo",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040033",
            "name": "Johnathan Baldwin II",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0039813",
        "name": "Evan Williams",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039813",
            "name": "Evan Williams",
            "posAbb": "SS",
            "posRank": 1
          }
        ]
      }
    ]
  },
  "HOU": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0039163",
        "name": "C.J. Stroud",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039163",
            "name": "C.J. Stroud",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036898",
            "name": "Davis Mills",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040211",
            "name": "Graham Mertz",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0035685",
        "name": "David Montgomery",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035685",
            "name": "David Montgomery",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040583",
            "name": "Woody Marks",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039603",
            "name": "British Brooks",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0040583",
        "name": "Woody Marks",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035685",
            "name": "David Montgomery",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040583",
            "name": "Woody Marks",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039603",
            "name": "British Brooks",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0038618",
        "name": "Xavier Hutchinson",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Nico Collins (Out)",
        "candidates": [
          {
            "gsis_id": "00-0036554",
            "name": "Nico Collins",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038618",
            "name": "Xavier Hutchinson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038608",
            "name": "Kayshon Boutte",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038608",
        "name": "Kayshon Boutte",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036554",
            "name": "Nico Collins",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038618",
            "name": "Xavier Hutchinson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038608",
            "name": "Kayshon Boutte",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0034383",
        "name": "Dalton Schultz",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034383",
            "name": "Dalton Schultz",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034981",
            "name": "Foster Moreau",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041472",
            "name": "Marlin Klein",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0040745",
        "name": "Aireontae Ersery",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040745",
            "name": "Aireontae Ersery",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039422",
            "name": "Nate Thomas",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0041532",
        "name": "Keylan Rutledge",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041532",
            "name": "Keylan Rutledge",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034399",
            "name": "Wyatt Teller",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034495",
            "name": "Evan Brown",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0034495",
        "name": "Evan Brown",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034495",
            "name": "Evan Brown",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039030",
            "name": "Jake Andrews",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041532",
            "name": "Keylan Rutledge",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0038131",
        "name": "Ed Ingram",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038131",
            "name": "Ed Ingram",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041559",
            "name": "Febechi Nwaiwu",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0032071",
        "name": "Trent Brown",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032071",
            "name": "Trent Brown",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039857",
            "name": "Blake Fisher",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034836",
            "name": "Braden Smith",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0031565",
        "name": "Danielle Hunter",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031565",
            "name": "Danielle Hunter",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039108",
            "name": "Will Anderson Jr.",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031364",
            "name": "Jadeveon Clowney",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037082",
            "name": "Dominique Robinson",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041305",
            "name": "Sabastian Harsh",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038724",
            "name": "Ali Gaye",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0039108",
        "name": "Will Anderson Jr.",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031565",
            "name": "Danielle Hunter",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039108",
            "name": "Will Anderson Jr.",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031364",
            "name": "Jadeveon Clowney",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037082",
            "name": "Dominique Robinson",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041305",
            "name": "Sabastian Harsh",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038724",
            "name": "Ali Gaye",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0032759",
        "name": "Sheldon Rankins",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032759",
            "name": "Sheldon Rankins",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036883",
            "name": "Tommy Togiai",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038127",
            "name": "Logan Hall",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032265",
            "name": "Mario Edwards Jr.",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041440",
            "name": "Kayden McDonald",
            "posAbb": "LDT",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039402",
            "name": "Jaden Crumedy",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0035166",
        "name": "Azeez Al-Shaair",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035166",
            "name": "Azeez Al-Shaair",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041449",
            "name": "Aiden Fisher",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037633",
            "name": "Jake Hummel",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037457",
            "name": "Jake Hansen",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039395",
            "name": "Jamal Hill",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041465",
            "name": "Wade Woodaz",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038599",
            "name": "Henry To'oTo'o",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040413",
            "name": "K.C. Ossai",
            "posAbb": "MLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0034987",
            "name": "E.J. Speed",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0041449",
        "name": "Aiden Fisher",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035166",
            "name": "Azeez Al-Shaair",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041449",
            "name": "Aiden Fisher",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037633",
            "name": "Jake Hummel",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037457",
            "name": "Jake Hansen",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039395",
            "name": "Jamal Hill",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041465",
            "name": "Wade Woodaz",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038599",
            "name": "Henry To'oTo'o",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040413",
            "name": "K.C. Ossai",
            "posAbb": "MLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0034987",
            "name": "E.J. Speed",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037237",
        "name": "Derek Stingley Jr.",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037237",
            "name": "Derek Stingley Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039343",
            "name": "Kamari Lassiter",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040149",
            "name": "Jaylin Smith",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034278",
            "name": "Tremon Smith",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041313",
            "name": "Collin Wright",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0039343",
        "name": "Kamari Lassiter",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037237",
            "name": "Derek Stingley Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039343",
            "name": "Kamari Lassiter",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040149",
            "name": "Jaylin Smith",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034278",
            "name": "Tremon Smith",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041313",
            "name": "Collin Wright",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0037246",
        "name": "Jalen Pitre",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037246",
            "name": "Jalen Pitre",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0039838",
        "name": "Calen Bullock",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039838",
            "name": "Calen Bullock",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034091",
            "name": "George Odum",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034355",
            "name": "M.J. Stewart",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0037130",
        "name": "Reed Blankenship",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037130",
            "name": "Reed Blankenship",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041466",
            "name": "Kamari Ramsey",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037661",
            "name": "Ja'Marcus Ingram",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "IND": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0035710",
        "name": "Daniel Jones",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035710",
            "name": "Daniel Jones",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039164",
            "name": "Anthony Richardson Sr.",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040206",
            "name": "Riley Leonard",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0036223",
        "name": "Jonathan Taylor",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036223",
            "name": "Jonathan Taylor",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041125",
            "name": "Seth McGowan",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040179",
            "name": "DJ Giddens",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0041125",
        "name": "Seth McGowan",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036223",
            "name": "Jonathan Taylor",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041125",
            "name": "Seth McGowan",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040179",
            "name": "DJ Giddens",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0037664",
        "name": "Alec Pierce",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037664",
            "name": "Alec Pierce",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038997",
            "name": "Josh Downs",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0030279",
            "name": "Keenan Allen",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038997",
        "name": "Josh Downs",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037664",
            "name": "Alec Pierce",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038997",
            "name": "Josh Downs",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0030279",
            "name": "Keenan Allen",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0030279",
        "name": "Keenan Allen",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037664",
            "name": "Alec Pierce",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038997",
            "name": "Josh Downs",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0030279",
            "name": "Keenan Allen",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0040128",
        "name": "Tyler Warren",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040128",
            "name": "Tyler Warren",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033217",
            "name": "Mo Alie-Cox",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037292",
            "name": "Drew Ogletree",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0037757",
        "name": "Bernhard Raimann",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037757",
            "name": "Bernhard Raimann",
            "posAbb": "LT",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0034342",
        "name": "Quenton Nelson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034342",
            "name": "Quenton Nelson",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039578",
            "name": "Dalton Tucker",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0039744",
        "name": "Tanor Bortolini",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039744",
            "name": "Tanor Bortolini",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039876",
            "name": "Sedrick Van Pran-Granger",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039736",
        "name": "Matt Goncalves",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039736",
            "name": "Matt Goncalves",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041517",
            "name": "Jalen Farmer",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0040163",
        "name": "Jalen Travis",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040163",
            "name": "Jalen Travis",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037305",
            "name": "Luke Tenuta",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0039340",
        "name": "Laiatu Latu",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039340",
            "name": "Laiatu Latu",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034825",
            "name": "Arden Key",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038107",
            "name": "Micheal Clemons",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040744",
            "name": "Jaylahn Tuimoloau",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041111",
            "name": "Caden Curry",
            "posAbb": "RDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041080",
            "name": "George Gumbs Jr.",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0034825",
        "name": "Arden Key",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039340",
            "name": "Laiatu Latu",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034825",
            "name": "Arden Key",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038107",
            "name": "Micheal Clemons",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040744",
            "name": "Jaylahn Tuimoloau",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041111",
            "name": "Caden Curry",
            "posAbb": "RDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041080",
            "name": "George Gumbs Jr.",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0032378",
        "name": "DeForest Buckner",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032378",
            "name": "DeForest Buckner",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033952",
            "name": "Grover Stewart",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035674",
            "name": "Jerry Tillery",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039031",
            "name": "Adetomiwa Adebawore",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040207",
            "name": "Tim Smith",
            "posAbb": "LDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0036298",
        "name": "Akeem Davis-Gaither",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036298",
            "name": "Akeem Davis-Gaither",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039377",
            "name": "Jaylon Carlies",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041518",
            "name": "Bryce Boettcher",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041227",
            "name": "Tahj Chambers",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039178",
            "name": "Austin Ajiake",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041039",
            "name": "CJ Allen",
            "posAbb": "SLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0039377",
        "name": "Jaylon Carlies",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036298",
            "name": "Akeem Davis-Gaither",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039377",
            "name": "Jaylon Carlies",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041518",
            "name": "Bryce Boettcher",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041227",
            "name": "Tahj Chambers",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039178",
            "name": "Austin Ajiake",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041039",
            "name": "CJ Allen",
            "posAbb": "SLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037190",
        "name": "Sauce Gardner",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037190",
            "name": "Sauce Gardner",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034573",
            "name": "Charvarius Ward",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038585",
            "name": "Cameron Mitchell",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037753",
            "name": "Cam Taylor-Britt",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0034573",
        "name": "Charvarius Ward",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037190",
            "name": "Sauce Gardner",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034573",
            "name": "Charvarius Ward",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038585",
            "name": "Cameron Mitchell",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037753",
            "name": "Cam Taylor-Britt",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0040139",
        "name": "Justin Walley",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040139",
            "name": "Justin Walley",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040928",
            "name": "Kapena Gushiken",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036629",
        "name": "Cam Bynum",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036629",
            "name": "Cam Bynum",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034485",
            "name": "Jonathan Owens",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0041043",
        "name": "A.J. Haulcy",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041043",
            "name": "A.J. Haulcy",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040235",
            "name": "Hunter Wohler",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "JAX": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0036971",
        "name": "Trevor Lawrence",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036971",
            "name": "Trevor Lawrence",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033319",
            "name": "Nick Mullens",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040234",
            "name": "Quinn Ewers",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0040719",
        "name": "Bhayshul Tuten",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040719",
            "name": "Bhayshul Tuten",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038611",
            "name": "Chris Rodriguez Jr.",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040238",
            "name": "LeQuint Allen Jr.",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0038611",
        "name": "Chris Rodriguez Jr.",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040719",
            "name": "Bhayshul Tuten",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038611",
            "name": "Chris Rodriguez Jr.",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040238",
            "name": "LeQuint Allen Jr.",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0039893",
        "name": "Brian Thomas Jr.",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039893",
            "name": "Brian Thomas Jr.",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038606",
            "name": "Parker Washington",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034960",
            "name": "Jakobi Meyers",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038606",
        "name": "Parker Washington",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039893",
            "name": "Brian Thomas Jr.",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038606",
            "name": "Parker Washington",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034960",
            "name": "Jakobi Meyers",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0034960",
        "name": "Jakobi Meyers",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039893",
            "name": "Brian Thomas Jr.",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038606",
            "name": "Parker Washington",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034960",
            "name": "Jakobi Meyers",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0038935",
        "name": "Brenton Strange",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038935",
            "name": "Brenton Strange",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041503",
            "name": "Nate Boerkircher",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036590",
            "name": "Quintin Morris",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0038934",
        "name": "Anton Harrison",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038934",
            "name": "Anton Harrison",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036975",
            "name": "Walker Little",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0041050",
        "name": "Emmanuel Pregnon",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041050",
            "name": "Emmanuel Pregnon",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038118",
            "name": "Daniel Faalele",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041208",
            "name": "Garrett DiGiorgio",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0036985",
        "name": "Robert Hainsey",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036985",
            "name": "Robert Hainsey",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040227",
            "name": "Jonah Monheim",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035062",
            "name": "Sam Mustipher",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036327",
        "name": "Ezra Cleveland",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036327",
            "name": "Ezra Cleveland",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040146",
            "name": "Wyatt Milum",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035112",
            "name": "Patrick Mekari",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0036655",
        "name": "Cole Van Lanen",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036655",
            "name": "Cole Van Lanen",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036975",
            "name": "Walker Little",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0035642",
        "name": "Josh Hines-Allen",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035642",
            "name": "Josh Hines-Allen",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037235",
            "name": "Travon Walker",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040342",
            "name": "Danny Striggow",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041218",
            "name": "Bryan Thomas Jr.",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041059",
            "name": "Wesley Williams",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041122",
            "name": "Zach Durfee",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0037235",
        "name": "Travon Walker",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035642",
            "name": "Josh Hines-Allen",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037235",
            "name": "Travon Walker",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040342",
            "name": "Danny Striggow",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041218",
            "name": "Bryan Thomas Jr.",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041059",
            "name": "Wesley Williams",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041122",
            "name": "Zach Durfee",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0032164",
        "name": "Arik Armstead",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032164",
            "name": "Arik Armstead",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036262",
            "name": "DaVon Hamilton",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034657",
            "name": "Matt Dickerson",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041045",
            "name": "Albert Regis",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039733",
            "name": "Ruke Orhorhoro",
            "posAbb": "LDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0034413",
        "name": "Foyesade Oluokun",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034413",
            "name": "Foyesade Oluokun",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038570",
            "name": "Ventrell Miller",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034473",
            "name": "Dennis Gardeck",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040326",
            "name": "Branson Combs",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035240",
            "name": "Jahlani Tavai",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040723",
            "name": "Jack Kiser",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041127",
            "name": "Parker Hughes",
            "posAbb": "MLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040395",
            "name": "Jared Bartlett",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0038570",
        "name": "Ventrell Miller",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034413",
            "name": "Foyesade Oluokun",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038570",
            "name": "Ventrell Miller",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034473",
            "name": "Dennis Gardeck",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040326",
            "name": "Branson Combs",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035240",
            "name": "Jahlani Tavai",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040723",
            "name": "Jack Kiser",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041127",
            "name": "Parker Hughes",
            "posAbb": "MLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040395",
            "name": "Jared Bartlett",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037313",
        "name": "Montaric Brown",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037313",
            "name": "Montaric Brown",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040718",
            "name": "Travis Hunter",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038616",
            "name": "Christian Braswell",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0040718",
        "name": "Travis Hunter",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037313",
            "name": "Montaric Brown",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040718",
            "name": "Travis Hunter",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038616",
            "name": "Christian Braswell",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0033928",
        "name": "Jourdan Lewis",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033928",
            "name": "Jourdan Lewis",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039353",
            "name": "Jarrian Jones",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0038596",
        "name": "Antonio Johnson",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038596",
            "name": "Antonio Johnson",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040145",
            "name": "Caleb Ransaw",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0033038",
        "name": "Eric Murray",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033038",
            "name": "Eric Murray",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040213",
            "name": "Rayuan Lane III",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041055",
            "name": "Jalen Huskey",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "KC": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0033873",
        "name": "Patrick Mahomes",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033873",
            "name": "Patrick Mahomes",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036945",
            "name": "Justin Fields",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040906",
            "name": "Garrett Nussmeier",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0038134",
        "name": "Kenneth Walker III",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038134",
            "name": "Kenneth Walker III",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038489",
            "name": "Ben VanSumeren",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041013",
            "name": "Emmett Johnson",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040078",
            "name": "Brashard Smith",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0038489",
        "name": "Ben VanSumeren",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038134",
            "name": "Kenneth Walker III",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038489",
            "name": "Ben VanSumeren",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041013",
            "name": "Emmett Johnson",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040078",
            "name": "Brashard Smith",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0039067",
        "name": "Rashee Rice",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039067",
            "name": "Rashee Rice",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039894",
            "name": "Xavier Worthy",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038104",
            "name": "Tyquan Thornton",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039894",
        "name": "Xavier Worthy",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039067",
            "name": "Rashee Rice",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039894",
            "name": "Xavier Worthy",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038104",
            "name": "Tyquan Thornton",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0038104",
        "name": "Tyquan Thornton",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039067",
            "name": "Rashee Rice",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039894",
            "name": "Xavier Worthy",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038104",
            "name": "Tyquan Thornton",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0030506",
        "name": "Travis Kelce",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0030506",
            "name": "Travis Kelce",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036637",
            "name": "Noah Gray",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040081",
            "name": "Jake Briningstool",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0040116",
        "name": "Josh Simmons",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040116",
            "name": "Josh Simmons",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041019",
            "name": "Kahlil Benson",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036557",
            "name": "Jaylon Moore",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0039844",
        "name": "Kingsley Suamataia",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039844",
            "name": "Kingsley Suamataia",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037207",
            "name": "Mike Caliendo",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037807",
            "name": "Joshua Ezeudu",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0036623",
        "name": "Creed Humphrey",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036623",
            "name": "Creed Humphrey",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039827",
            "name": "Hunter Nourzad",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036660",
        "name": "Trey Smith",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036660",
            "name": "Trey Smith",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037207",
            "name": "Mike Caliendo",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037266",
            "name": "Matt Waletzko",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0041019",
        "name": "Kahlil Benson",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041019",
            "name": "Kahlil Benson",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036557",
            "name": "Jaylon Moore",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040987",
            "name": "Diego Pounds",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0039006",
        "name": "Felix Anudike-Uzomah",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039006",
            "name": "Felix Anudike-Uzomah",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037192",
            "name": "George Karlaftis",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041501",
            "name": "R Mason Thomas",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040640",
            "name": "Ashton Gillotte",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041256",
            "name": "Jack Pyburn",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040118",
            "name": "Cooper McDonald",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0037192",
        "name": "George Karlaftis",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039006",
            "name": "Felix Anudike-Uzomah",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037192",
            "name": "George Karlaftis",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041501",
            "name": "R Mason Thomas",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040640",
            "name": "Ashton Gillotte",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041256",
            "name": "Jack Pyburn",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040118",
            "name": "Cooper McDonald",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0032762",
        "name": "Chris Jones",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032762",
            "name": "Chris Jones",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036909",
            "name": "Khyiris Tonga",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041545",
            "name": "Peter Woods",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041358",
            "name": "Bryson Eason",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039433",
            "name": "Marcus Harris",
            "posAbb": "LDT",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040748",
            "name": "Omarr Norman-Lott",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0036621",
        "name": "Nick Bolton",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036621",
            "name": "Nick Bolton",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035262",
            "name": "Drue Tranquill",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040072",
            "name": "Jeffrey Bassa",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037208",
            "name": "Jack Cochrane",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035900",
            "name": "Cole Christiansen",
            "posAbb": "SLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0035262",
        "name": "Drue Tranquill",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036621",
            "name": "Nick Bolton",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035262",
            "name": "Drue Tranquill",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040072",
            "name": "Jeffrey Bassa",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037208",
            "name": "Jack Cochrane",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035900",
            "name": "Cole Christiansen",
            "posAbb": "SLB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0040670",
        "name": "Nohl Williams",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040670",
            "name": "Nohl Williams",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041543",
            "name": "Mansoor Delane",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036416",
            "name": "Kristian Fulton",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039324",
            "name": "Chris Roland-Wallace",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0041543",
        "name": "Mansoor Delane",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040670",
            "name": "Nohl Williams",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041543",
            "name": "Mansoor Delane",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036416",
            "name": "Kristian Fulton",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039324",
            "name": "Chris Roland-Wallace",
            "posAbb": "LCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0036374",
        "name": "L'Jarius Sneed",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036374",
            "name": "L'Jarius Sneed",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041497",
            "name": "Jadon Canady",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036380",
        "name": "Alohi Gilman",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036380",
            "name": "Alohi Gilman",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040957",
            "name": "Xavier Nwankpa",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0039825",
        "name": "Jaden Hicks",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Chamarri Conner (Out)",
        "candidates": [
          {
            "gsis_id": "00-0038982",
            "name": "Chamarri Conner",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039825",
            "name": "Jaden Hicks",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "LAC": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0036355",
        "name": "Justin Herbert",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036355",
            "name": "Justin Herbert",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037012",
            "name": "Trey Lance",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0040666",
        "name": "Omarion Hampton",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040666",
            "name": "Omarion Hampton",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035125",
            "name": "Alec Ingold",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038454",
            "name": "Keaton Mitchell",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038614",
            "name": "Scott Matlock",
            "posAbb": "FB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039391",
            "name": "Kimani Vidal",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0035125",
        "name": "Alec Ingold",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040666",
            "name": "Omarion Hampton",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035125",
            "name": "Alec Ingold",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038454",
            "name": "Keaton Mitchell",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038614",
            "name": "Scott Matlock",
            "posAbb": "FB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039391",
            "name": "Kimani Vidal",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0039915",
        "name": "Ladd McConkey",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039915",
            "name": "Ladd McConkey",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038544",
            "name": "Quentin Johnston",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040727",
            "name": "Tre' Harris",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038544",
        "name": "Quentin Johnston",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039915",
            "name": "Ladd McConkey",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038544",
            "name": "Quentin Johnston",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040727",
            "name": "Tre' Harris",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0040727",
        "name": "Tre' Harris",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039915",
            "name": "Ladd McConkey",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038544",
            "name": "Quentin Johnston",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040727",
            "name": "Tre' Harris",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0038046",
        "name": "Charlie Kolar",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038046",
            "name": "Charlie Kolar",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033885",
            "name": "David Njoku",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040189",
            "name": "Oronde Gadsden",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0037009",
        "name": "Rashawn Slater",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037009",
            "name": "Rashawn Slater",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035688",
            "name": "Trey Pipkins III",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041105",
            "name": "Logan Taylor",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0036736",
        "name": "Kayode Awosika",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036736",
            "name": "Kayode Awosika",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035688",
            "name": "Trey Pipkins III",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041107",
            "name": "Alex Harkey",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0041392",
        "name": "Jake Slaughter",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041392",
            "name": "Jake Slaughter",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041383",
            "name": "Jacob Spomer",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036376",
            "name": "Tyler Biadasz",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0038103",
        "name": "Cole Strange",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038103",
            "name": "Cole Strange",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037241",
            "name": "Trevor Penning",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0039897",
        "name": "Joe Alt",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039897",
            "name": "Joe Alt",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041058",
            "name": "Travis Burke",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0040144",
        "name": "Jamaree Caldwell",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040144",
            "name": "Jamaree Caldwell",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036181",
            "name": "Teair Tart",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039835",
            "name": "Justin Eboigbe",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041072",
            "name": "Nick Barrett",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0036181",
        "name": "Teair Tart",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040144",
            "name": "Jamaree Caldwell",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036181",
            "name": "Teair Tart",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039835",
            "name": "Justin Eboigbe",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041072",
            "name": "Nick Barrett",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0033546",
        "name": "Dalvin Tomlinson",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033546",
            "name": "Dalvin Tomlinson",
            "posAbb": "NT",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0038553",
        "name": "Daiyan Henley",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038553",
            "name": "Daiyan Henley",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039111",
            "name": "Tuli Tuipulotu",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031040",
            "name": "Khalil Mack",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035202",
            "name": "Del'Shawn Phillips",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041544",
            "name": "Akheem Mesidor",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032146",
            "name": "Bud Dupree",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036338",
            "name": "Troy Dye",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040460",
            "name": "Marlowe Wax",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032103",
            "name": "Denzel Perryman",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0039111",
        "name": "Tuli Tuipulotu",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038553",
            "name": "Daiyan Henley",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039111",
            "name": "Tuli Tuipulotu",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031040",
            "name": "Khalil Mack",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035202",
            "name": "Del'Shawn Phillips",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041544",
            "name": "Akheem Mesidor",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032146",
            "name": "Bud Dupree",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036338",
            "name": "Troy Dye",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040460",
            "name": "Marlowe Wax",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032103",
            "name": "Denzel Perryman",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039369",
        "name": "Cam Hart",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039369",
            "name": "Cam Hart",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034356",
            "name": "Donte Jackson",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041381",
            "name": "Rodney Shelley",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037320",
            "name": "Deane Leonard",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040065",
            "name": "Isas Waxter",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0034356",
        "name": "Donte Jackson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039369",
            "name": "Cam Hart",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034356",
            "name": "Donte Jackson",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041381",
            "name": "Rodney Shelley",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037320",
            "name": "Deane Leonard",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040065",
            "name": "Isas Waxter",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039366",
        "name": "Tarheeb Still",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039366",
            "name": "Tarheeb Still",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0041064",
        "name": "Genesis Smith",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Elijah Molden (Out)",
        "candidates": [
          {
            "gsis_id": "00-0036992",
            "name": "Elijah Molden",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041064",
            "name": "Genesis Smith",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040221",
            "name": "RJ Mickens",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0034790",
        "name": "Derwin James Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034790",
            "name": "Derwin James Jr.",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0030294",
            "name": "Tony Jefferson",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "LAR": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0026498",
        "name": "Matthew Stafford",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0026498",
            "name": "Matthew Stafford",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039107",
            "name": "Stetson Bennett IV",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041568",
            "name": "Ty Simpson",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0037840",
        "name": "Kyren Williams",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037840",
            "name": "Kyren Williams",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039738",
            "name": "Blake Corum",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037557",
            "name": "Ronnie Rivers",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0039738",
        "name": "Blake Corum",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037840",
            "name": "Kyren Williams",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039738",
            "name": "Blake Corum",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037557",
            "name": "Ronnie Rivers",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0039075",
        "name": "Puka Nacua",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039075",
            "name": "Puka Nacua",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031381",
            "name": "Davante Adams",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039751",
            "name": "Jordan Whittington",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0031381",
        "name": "Davante Adams",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039075",
            "name": "Puka Nacua",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031381",
            "name": "Davante Adams",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039751",
            "name": "Jordan Whittington",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0039751",
        "name": "Jordan Whittington",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039075",
            "name": "Puka Nacua",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031381",
            "name": "Davante Adams",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039751",
            "name": "Jordan Whittington",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0036244",
        "name": "Colby Parkinson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036244",
            "name": "Colby Parkinson",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033110",
            "name": "Tyler Higbee",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040737",
            "name": "Terrance Ferguson",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0036603",
        "name": "Alaric Jackson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036603",
            "name": "Alaric Jackson",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0030097",
            "name": "David Quessenberry",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0039058",
        "name": "Steve Avila",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039058",
            "name": "Steve Avila",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039753",
            "name": "Beaux Limmer",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036093",
            "name": "Bill Murray",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0034114",
        "name": "Coleman Shelton",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034114",
            "name": "Coleman Shelton",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039830",
            "name": "Dylan McMahon",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036339",
        "name": "Kevin Dotson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036339",
            "name": "Kevin Dotson",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039784",
            "name": "Justin Dedich",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0039077",
        "name": "Warren McClendon Jr.",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039077",
            "name": "Warren McClendon Jr.",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041394",
            "name": "Keagen Trost",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0039138",
        "name": "Kobie Turner",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039138",
            "name": "Kobie Turner",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031388",
            "name": "Aaron Donald",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039749",
            "name": "Tyler Davis",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039734",
            "name": "Braden Fiske",
            "posAbb": "RDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0031388",
        "name": "Aaron Donald",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039138",
            "name": "Kobie Turner",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031388",
            "name": "Aaron Donald",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039749",
            "name": "Tyler Davis",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039734",
            "name": "Braden Fiske",
            "posAbb": "RDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0034234",
        "name": "Poona Ford",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034234",
            "name": "Poona Ford",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040585",
            "name": "Ty Hamilton",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0039137",
        "name": "Byron Young",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039137",
            "name": "Byron Young",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039774",
            "name": "Omar Speights",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039061",
            "name": "Desjuan Johnson",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037587",
            "name": "Nate Landman",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040580",
            "name": "Josaiah Stewart",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040613",
            "name": "Shaun Dolac",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036672",
            "name": "Grant Stuard",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041404",
            "name": "Wesley Bailey",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033868",
            "name": "Myles Garrett",
            "posAbb": "SLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041429",
            "name": "Eddie Walls III",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0039774",
        "name": "Omar Speights",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039137",
            "name": "Byron Young",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039774",
            "name": "Omar Speights",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039061",
            "name": "Desjuan Johnson",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037587",
            "name": "Nate Landman",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040580",
            "name": "Josaiah Stewart",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040613",
            "name": "Shaun Dolac",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036672",
            "name": "Grant Stuard",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041404",
            "name": "Wesley Bailey",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033868",
            "name": "Myles Garrett",
            "posAbb": "SLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041429",
            "name": "Eddie Walls III",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037195",
        "name": "Jaylen Watson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037195",
            "name": "Jaylen Watson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037191",
            "name": "Trent McDuffie",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039151",
            "name": "Emmanuel Forbes Jr.",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0037191",
        "name": "Trent McDuffie",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037195",
            "name": "Jaylen Watson",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037191",
            "name": "Trent McDuffie",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039151",
            "name": "Emmanuel Forbes Jr.",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0037841",
        "name": "Quentin Lake",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037841",
            "name": "Quentin Lake",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039772",
            "name": "Josh Wallace",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0038366",
        "name": "Tanner Ingle",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Kamren Kinchens (Out)",
        "candidates": [
          {
            "gsis_id": "00-0039834",
            "name": "Kamren Kinchens",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038366",
            "name": "Tanner Ingle",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0036349",
        "name": "Kam Curl",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036349",
            "name": "Kam Curl",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039776",
            "name": "Jaylen McCollough",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "LV": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0029604",
        "name": "Kirk Cousins",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0029604",
            "name": "Kirk Cousins",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041562",
            "name": "Fernando Mendoza",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038579",
            "name": "Aidan O'Connell",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0040122",
        "name": "Ashton Jeanty",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040122",
            "name": "Ashton Jeanty",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037304",
            "name": "Connor Heyward",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040878",
            "name": "Mike Washington Jr.",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039407",
            "name": "Dylan Laube",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0037304",
        "name": "Connor Heyward",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040122",
            "name": "Ashton Jeanty",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037304",
            "name": "Connor Heyward",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040878",
            "name": "Mike Washington Jr.",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039407",
            "name": "Dylan Laube",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0038563",
        "name": "Tre Tucker",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038563",
            "name": "Tre Tucker",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037291",
            "name": "Jalen Nailor",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040729",
            "name": "Jack Bech",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0037291",
        "name": "Jalen Nailor",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038563",
            "name": "Tre Tucker",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037291",
            "name": "Jalen Nailor",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040729",
            "name": "Jack Bech",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0040729",
        "name": "Jack Bech",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038563",
            "name": "Tre Tucker",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037291",
            "name": "Jalen Nailor",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040729",
            "name": "Jack Bech",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0039338",
        "name": "Brock Bowers",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039338",
            "name": "Brock Bowers",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039066",
            "name": "Michael Mayer",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034365",
            "name": "Ian Thomas",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0034759",
        "name": "Kolton Miller",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034759",
            "name": "Kolton Miller",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040151",
            "name": "Charles Grant",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0037829",
        "name": "Spencer Burford",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037829",
            "name": "Spencer Burford",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040650",
            "name": "Bryce Cabeldue",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0037825",
        "name": "Tyler Linderbaum",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037825",
            "name": "Tyler Linderbaum",
            "posAbb": "C",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039735",
        "name": "Jackson Powers-Johnson",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039735",
            "name": "Jackson Powers-Johnson",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040150",
            "name": "Caleb Rogers",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041003",
            "name": "Justin Pickett",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0039349",
        "name": "DJ Glaze",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039349",
            "name": "DJ Glaze",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040871",
            "name": "Trey Zuhn III",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038923",
            "name": "Dalton Wagner",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0040169",
        "name": "Tonka Hemingway",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040169",
            "name": "Tonka Hemingway",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039423",
            "name": "Jonah Laulu",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034275",
            "name": "Folorunso Fatukasi",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037262",
            "name": "Thomas Booker IV",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0039423",
        "name": "Jonah Laulu",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040169",
            "name": "Tonka Hemingway",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039423",
            "name": "Jonah Laulu",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034275",
            "name": "Folorunso Fatukasi",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037262",
            "name": "Thomas Booker IV",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0033381",
        "name": "Adam Butler",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033381",
            "name": "Adam Butler",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040199",
            "name": "JJ Pegues",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0037615",
        "name": "Nakobe Dean",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037615",
            "name": "Nakobe Dean",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037074",
            "name": "Quay Walker",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034973",
            "name": "Maxx Crosby",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036479",
            "name": "Kwity Paye",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036989",
            "name": "Malcolm Koonce",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039374",
            "name": "Tommy Eichenberg",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036922",
            "name": "Patrick Johnson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040228",
            "name": "Cody Lindenberg",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039836",
            "name": "Brennan Jackson",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0037527",
            "name": "Segun Olubi",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041553",
            "name": "Keyron Crawford",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0037074",
        "name": "Quay Walker",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037615",
            "name": "Nakobe Dean",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037074",
            "name": "Quay Walker",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034973",
            "name": "Maxx Crosby",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036479",
            "name": "Kwity Paye",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036989",
            "name": "Malcolm Koonce",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039374",
            "name": "Tommy Eichenberg",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036922",
            "name": "Patrick Johnson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040228",
            "name": "Cody Lindenberg",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039836",
            "name": "Brennan Jackson",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0037527",
            "name": "Segun Olubi",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041553",
            "name": "Keyron Crawford",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0036901",
        "name": "Eric Stokes",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036901",
            "name": "Eric Stokes",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040641",
            "name": "Darien Porter",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040889",
            "name": "Hezekiah Masses",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041563",
            "name": "Jermod McCoy",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038594",
            "name": "Darrell Luter Jr.",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039676",
            "name": "Chigozie Anusiem",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0040889",
        "name": "Hezekiah Masses",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Darien Porter (Out)",
        "candidates": [
          {
            "gsis_id": "00-0036901",
            "name": "Eric Stokes",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040641",
            "name": "Darien Porter",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040889",
            "name": "Hezekiah Masses",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041563",
            "name": "Jermod McCoy",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038594",
            "name": "Darrell Luter Jr.",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039676",
            "name": "Chigozie Anusiem",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0034376",
        "name": "Taron Johnson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034376",
            "name": "Taron Johnson",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0040868",
        "name": "Treydan Stukes",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040868",
            "name": "Treydan Stukes",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037512",
            "name": "Isaiah Pola-Mao",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037461",
            "name": "Tristin McCollum",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0036293",
        "name": "Jeremy Chinn",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036293",
            "name": "Jeremy Chinn",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040883",
            "name": "Dalton Johnson",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "MIA": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0038128",
        "name": "Malik Willis",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038128",
            "name": "Malik Willis",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040014",
            "name": "Kyle McCord",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040398",
            "name": "Brady Cook",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0039040",
        "name": "De'Von Achane",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039040",
            "name": "De'Von Achane",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041436",
            "name": "DJ Herman",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039874",
            "name": "Jaylen Wright",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040198",
            "name": "Ollie Gordon II",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0041436",
        "name": "DJ Herman",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039040",
            "name": "De'Von Achane",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041436",
            "name": "DJ Herman",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039874",
            "name": "Jaylen Wright",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040198",
            "name": "Ollie Gordon II",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0039880",
        "name": "Malik Washington",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039880",
            "name": "Malik Washington",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041523",
            "name": "Caleb Douglas",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041525",
            "name": "Chris Bell",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0041523",
        "name": "Caleb Douglas",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039880",
            "name": "Malik Washington",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041523",
            "name": "Caleb Douglas",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041525",
            "name": "Chris Bell",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0041525",
        "name": "Chris Bell",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039880",
            "name": "Malik Washington",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041523",
            "name": "Caleb Douglas",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041525",
            "name": "Chris Bell",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0037252",
        "name": "Greg Dulcich",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037252",
            "name": "Greg Dulcich",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041524",
            "name": "Will Kacmarek",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041579",
            "name": "Seydou Traore",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0039899",
        "name": "Patrick Paul",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039899",
            "name": "Patrick Paul",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039174",
            "name": "Chukwuebuka Godrick",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0041521",
        "name": "Kadyn Proctor",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041521",
            "name": "Kadyn Proctor",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039832",
            "name": "Jarrett Kingston",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0036171",
        "name": "Aaron Brewer",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036171",
            "name": "Aaron Brewer",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039485",
            "name": "Andrew Meyer",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0040742",
        "name": "Jonah Savaiinaea",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040742",
            "name": "Jonah Savaiinaea",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039863",
            "name": "Caedan Wallace",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041530",
            "name": "DJ Campbell",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0036248",
        "name": "Austin Jackson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036248",
            "name": "Austin Jackson",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039863",
            "name": "Caedan Wallace",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039174",
            "name": "Chukwuebuka Godrick",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0036159",
        "name": "Josh Uche",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Chop Robinson (Out)",
        "candidates": [
          {
            "gsis_id": "00-0039911",
            "name": "Chop Robinson",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036159",
            "name": "Josh Uche",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036682",
            "name": "Malik Herring",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038603",
            "name": "Robert Beal Jr.",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035692",
            "name": "Clelin Ferrell",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0036682",
        "name": "Malik Herring",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039911",
            "name": "Chop Robinson",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036159",
            "name": "Josh Uche",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036682",
            "name": "Malik Herring",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038603",
            "name": "Robert Beal Jr.",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035692",
            "name": "Clelin Ferrell",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0034285",
        "name": "Zach Sieler",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034285",
            "name": "Zach Sieler",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031557",
            "name": "Jordan Phillips",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040248",
            "name": "Zeek Biggers",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040655",
            "name": "Keith Cooper Jr.",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040127",
            "name": "Kenneth Grant",
            "posAbb": "LDT",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041136",
            "name": "Rene Konga",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0041522",
        "name": "Jacob Rodriguez",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041522",
            "name": "Jacob Rodriguez",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036409",
            "name": "Jordyn Brooks",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036362",
            "name": "Willie Gay Jr.",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040066",
            "name": "Jackson Woodard",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034779",
            "name": "Ronnie Harrison Jr.",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038429",
            "name": "Liam Anderson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041526",
            "name": "Trey Moore",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0036409",
        "name": "Jordyn Brooks",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041522",
            "name": "Jacob Rodriguez",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036409",
            "name": "Jordyn Brooks",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036362",
            "name": "Willie Gay Jr.",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040066",
            "name": "Jackson Woodard",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034779",
            "name": "Ronnie Harrison Jr.",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038429",
            "name": "Liam Anderson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041526",
            "name": "Trey Moore",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0040178",
        "name": "Jason Marshall Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040178",
            "name": "Jason Marshall Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039156",
            "name": "JuJu Brents",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039383",
            "name": "Jaylin Simpson",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039390",
            "name": "Marcellas Dial Jr.",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037549",
            "name": "Darrell Baker Jr.",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039481",
            "name": "Storm Duck",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0039156",
        "name": "JuJu Brents",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040178",
            "name": "Jason Marshall Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039156",
            "name": "JuJu Brents",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039383",
            "name": "Jaylin Simpson",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039390",
            "name": "Marcellas Dial Jr.",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037549",
            "name": "Darrell Baker Jr.",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039481",
            "name": "Storm Duck",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0041533",
        "name": "Chris Johnson",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041533",
            "name": "Chris Johnson",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038521",
            "name": "Reese Taylor",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036677",
        "name": "Zayne Anderson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036677",
            "name": "Zayne Anderson",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039532",
            "name": "Julius Wood",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0041528",
        "name": "Michael Taaffe",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041528",
            "name": "Michael Taaffe",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040182",
            "name": "Dante Trader Jr.",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041527",
            "name": "Kyle Louis",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "MIN": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0032950",
        "name": "Carson Wentz",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Kyler Murray (Out)",
        "candidates": [
          {
            "gsis_id": "00-0035228",
            "name": "Kyler Murray",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032950",
            "name": "Carson Wentz",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039923",
            "name": "J.J. McCarthy",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0041081",
        "name": "Max Bredeson",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041081",
            "name": "Max Bredeson",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033293",
            "name": "Aaron Jones Sr.",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041104",
            "name": "Demond Claiborne",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036425",
            "name": "DeeJay Dallas",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0033293",
        "name": "Aaron Jones Sr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041081",
            "name": "Max Bredeson",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033293",
            "name": "Aaron Jones Sr.",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041104",
            "name": "Demond Claiborne",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036425",
            "name": "DeeJay Dallas",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036322",
        "name": "Justin Jefferson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036322",
            "name": "Justin Jefferson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038994",
            "name": "Jordan Addison",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036259",
            "name": "Jauan Jennings",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038994",
        "name": "Jordan Addison",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036322",
            "name": "Justin Jefferson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038994",
            "name": "Jordan Addison",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036259",
            "name": "Jauan Jennings",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0035229",
        "name": "T.J. Hockenson",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035229",
            "name": "T.J. Hockenson",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035249",
            "name": "Josh Oliver",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040215",
            "name": "Gavin Bartholomew",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0036616",
        "name": "Christian Darrisaw",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036616",
            "name": "Christian Darrisaw",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037404",
            "name": "Ryan Van Demark",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0040661",
        "name": "Donovan Jackson",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040661",
            "name": "Donovan Jackson",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040500",
            "name": "Joe Huber",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0036347",
        "name": "Blake Brandel",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036347",
            "name": "Blake Brandel",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039237",
            "name": "Nick Samac",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039419",
            "name": "Michael Jurgens",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036483",
        "name": "Will Fries",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036483",
            "name": "Will Fries",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039310",
            "name": "Trevor Keegan",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0034158",
        "name": "Brian O'Neill",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034158",
            "name": "Brian O'Neill",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041053",
            "name": "Caleb Tiernan",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0038778",
        "name": "Jalen Redmond",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038778",
            "name": "Jalen Redmond",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039421",
            "name": "Levi Drake Rodriguez",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040173",
            "name": "Tyrion Ingram-Dawkins",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040624",
            "name": "Elijah Williams",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0039421",
        "name": "Levi Drake Rodriguez",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038778",
            "name": "Jalen Redmond",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039421",
            "name": "Levi Drake Rodriguez",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040173",
            "name": "Tyrion Ingram-Dawkins",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040624",
            "name": "Elijah Williams",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0041033",
        "name": "Caleb Banks",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041033",
            "name": "Caleb Banks",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041046",
            "name": "Domonique Orange",
            "posAbb": "NT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039720",
            "name": "Taki Taimani",
            "posAbb": "NT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0033336",
        "name": "Eric Wilson",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033336",
            "name": "Eric Wilson",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035276",
            "name": "Blake Cashman",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039924",
            "name": "Dallas Turner",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035272",
            "name": "Andrew Van Ginkel",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031360",
            "name": "Kyle Van Noy",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041495",
            "name": "Jake Golday",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038807",
            "name": "Ivan Pace Jr.",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040496",
            "name": "Chaz Chambliss",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039718",
            "name": "Bo Richter",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0033872",
            "name": "Jamal Adams",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040492",
            "name": "Tyler Batty",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0035276",
        "name": "Blake Cashman",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033336",
            "name": "Eric Wilson",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035276",
            "name": "Blake Cashman",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039924",
            "name": "Dallas Turner",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035272",
            "name": "Andrew Van Ginkel",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031360",
            "name": "Kyle Van Noy",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041495",
            "name": "Jake Golday",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038807",
            "name": "Ivan Pace Jr.",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040496",
            "name": "Chaz Chambliss",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039718",
            "name": "Bo Richter",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0033872",
            "name": "Jamal Adams",
            "posAbb": "RILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040492",
            "name": "Tyler Batty",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0035795",
        "name": "James Pierre",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035795",
            "name": "James Pierre",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041083",
            "name": "Charles Demmings",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040507",
            "name": "Zemaiah Vaughn",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0041083",
        "name": "Charles Demmings",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035795",
            "name": "James Pierre",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041083",
            "name": "Charles Demmings",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040507",
            "name": "Zemaiah Vaughn",
            "posAbb": "RCB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0035236",
        "name": "Byron Murphy Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035236",
            "name": "Byron Murphy Jr.",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041344",
            "name": "Tyreek Chappell",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0029606",
        "name": "Harrison Smith",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0029606",
            "name": "Harrison Smith",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037301",
            "name": "Theo Jackson",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041354",
            "name": "Jacob Thomas",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0036348",
        "name": "Joshua Metellus",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036348",
            "name": "Joshua Metellus",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038578",
            "name": "Jay Ward",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041054",
            "name": "Jakobe Thomas",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "NE": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0039851",
        "name": "Drake Maye",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039851",
            "name": "Drake Maye",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038476",
            "name": "Tommy DeVito",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041123",
            "name": "Behren Morton",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0036875",
        "name": "Rhamondre Stevenson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036875",
            "name": "Rhamondre Stevenson",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036187",
            "name": "Reggie Gilliam",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040734",
            "name": "TreVeyon Henderson",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040556",
            "name": "Corey Kiner",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0036187",
        "name": "Reggie Gilliam",
        "grade": "Average",
        "rating": 70,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036875",
            "name": "Rhamondre Stevenson",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036187",
            "name": "Reggie Gilliam",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040734",
            "name": "TreVeyon Henderson",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040556",
            "name": "Corey Kiner",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0037816",
        "name": "Romeo Doubs",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037816",
            "name": "Romeo Doubs",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038621",
            "name": "DeMario Douglas",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033555",
            "name": "Mack Hollins",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038621",
        "name": "DeMario Douglas",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037816",
            "name": "Romeo Doubs",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038621",
            "name": "DeMario Douglas",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033555",
            "name": "Mack Hollins",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0033555",
        "name": "Mack Hollins",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037816",
            "name": "Romeo Doubs",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038621",
            "name": "DeMario Douglas",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033555",
            "name": "Mack Hollins",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0033090",
        "name": "Hunter Henry",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033090",
            "name": "Hunter Henry",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041395",
            "name": "Eli Raridon",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041314",
            "name": "Tanner Arkin",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0040699",
        "name": "Will Campbell",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040699",
            "name": "Will Campbell",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041103",
            "name": "Dametrious Crownover",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0036979",
        "name": "Alijah Vera-Tucker",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036979",
            "name": "Alijah Vera-Tucker",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0029685",
            "name": "Greg Van Roten",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0040147",
        "name": "Jared Wilson",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040147",
            "name": "Jared Wilson",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037413",
            "name": "Ben Brown",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036198",
        "name": "Mike Onwenu",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036198",
            "name": "Mike Onwenu",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039828",
            "name": "Walter Rouse",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037413",
            "name": "Ben Brown",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0031330",
        "name": "Morgan Moses",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031330",
            "name": "Morgan Moses",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041541",
            "name": "Caleb Lomu",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040226",
            "name": "Marcus Bryant",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0036916",
        "name": "Milton Williams",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036916",
            "name": "Milton Williams",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036981",
            "name": "Christian Barmore",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039289",
            "name": "Leonard Taylor III",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0031054",
            "name": "DaQuan Jones",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040171",
            "name": "Joshua Farmer",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0036981",
        "name": "Christian Barmore",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036916",
            "name": "Milton Williams",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036981",
            "name": "Christian Barmore",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039289",
            "name": "Leonard Taylor III",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0031054",
            "name": "DaQuan Jones",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040171",
            "name": "Joshua Farmer",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0038653",
        "name": "Cory Durden",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038653",
            "name": "Cory Durden",
            "posAbb": "NT",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0034720",
        "name": "Robert Spillane",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034720",
            "name": "Robert Spillane",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036813",
            "name": "Christian Elliss",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035678",
            "name": "Dre'Mont Jones",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040574",
            "name": "Elijah Ponder",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041569",
            "name": "Gabe Jacas",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041402",
            "name": "Quintayvious Hutchins",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039829",
            "name": "Darius Muasau",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041455",
            "name": "Erick Hunter",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034828",
            "name": "Harold Landry III",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041109",
            "name": "Namdi Obiazor",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041321",
            "name": "Khalil Jacobs",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0036813",
        "name": "Christian Elliss",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034720",
            "name": "Robert Spillane",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036813",
            "name": "Christian Elliss",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035678",
            "name": "Dre'Mont Jones",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040574",
            "name": "Elijah Ponder",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041569",
            "name": "Gabe Jacas",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041402",
            "name": "Quintayvious Hutchins",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039829",
            "name": "Darius Muasau",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041455",
            "name": "Erick Hunter",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034828",
            "name": "Harold Landry III",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041109",
            "name": "Namdi Obiazor",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0041321",
            "name": "Khalil Jacobs",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039147",
        "name": "Christian Gonzalez",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039147",
            "name": "Christian Gonzalez",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034778",
            "name": "Carlton Davis III",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039770",
            "name": "Charles Woods",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041088",
            "name": "Karon Prunty",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041316",
            "name": "Channing Canada",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0039770",
        "name": "Charles Woods",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Carlton Davis III (Out)",
        "candidates": [
          {
            "gsis_id": "00-0039147",
            "name": "Christian Gonzalez",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034778",
            "name": "Carlton Davis III",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039770",
            "name": "Charles Woods",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041088",
            "name": "Karon Prunty",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041316",
            "name": "Channing Canada",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0037253",
        "name": "Marcus Jones",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037253",
            "name": "Marcus Jones",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0033132",
        "name": "Kevin Byard",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033132",
            "name": "Kevin Byard",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040204",
            "name": "Jaylen Reed",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037205",
            "name": "Brenden Schooler",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0040716",
        "name": "Craig Woodson",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040716",
            "name": "Craig Woodson",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039692",
            "name": "Dell Pettus",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "NO": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0040743",
        "name": "Tyler Shough",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040743",
            "name": "Tyler Shough",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039376",
            "name": "Spencer Rattler",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037013",
            "name": "Zach Wilson",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0036973",
        "name": "Travis Etienne Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036973",
            "name": "Travis Etienne Jr.",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033906",
            "name": "Alvin Kamara",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038551",
            "name": "Kendre Miller",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0033906",
        "name": "Alvin Kamara",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036973",
            "name": "Travis Etienne Jr.",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033906",
            "name": "Alvin Kamara",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038551",
            "name": "Kendre Miller",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0037239",
        "name": "Chris Olave",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037239",
            "name": "Chris Olave",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039424",
            "name": "Devaughn Vele",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041099",
            "name": "Barion Brown",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039424",
        "name": "Devaughn Vele",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037239",
            "name": "Chris Olave",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039424",
            "name": "Devaughn Vele",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041099",
            "name": "Barion Brown",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0041099",
        "name": "Barion Brown",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037239",
            "name": "Chris Olave",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039424",
            "name": "Devaughn Vele",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041099",
            "name": "Barion Brown",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0036040",
        "name": "Juwan Johnson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036040",
            "name": "Juwan Johnson",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035644",
            "name": "Noah Fant",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041041",
            "name": "Oscar Delp",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0040125",
        "name": "Kelvin Banks Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040125",
            "name": "Kelvin Banks Jr.",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038601",
            "name": "Asim Richards",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0035668",
        "name": "David Edwards",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035668",
            "name": "David Edwards",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036619",
            "name": "Dillon Radunz",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038566",
            "name": "Nick Saldiveri",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0035242",
        "name": "Erik McCoy",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035242",
            "name": "Erik McCoy",
            "posAbb": "C",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036408",
        "name": "Cesar Ruiz",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036408",
            "name": "Cesar Ruiz",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041065",
            "name": "Jeremiah Wright",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036535",
            "name": "William Sherman",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0039339",
        "name": "Taliese Fuaga",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039339",
            "name": "Taliese Fuaga",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041173",
            "name": "Mason Murphy",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0038387",
        "name": "Colby Wooden",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038387",
            "name": "Colby Wooden",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0027962",
            "name": "Cameron Jordan",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040642",
            "name": "Vernon Broughton",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037283",
            "name": "John Ridgeway III",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038541",
            "name": "Tyree Wilson",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038995",
            "name": "Bryan Bresee",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0027962",
        "name": "Cameron Jordan",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038387",
            "name": "Colby Wooden",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0027962",
            "name": "Cameron Jordan",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040642",
            "name": "Vernon Broughton",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037283",
            "name": "John Ridgeway III",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038541",
            "name": "Tyree Wilson",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038995",
            "name": "Bryan Bresee",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0033860",
        "name": "Davon Godchaux",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033860",
            "name": "Davon Godchaux",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034760",
            "name": "Nathan Shepherd",
            "posAbb": "NT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041390",
            "name": "Christen Miller",
            "posAbb": "NT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0035316",
        "name": "Kaden Elliss",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035316",
            "name": "Kaden Elliss",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035402",
            "name": "Carl Granderson",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036321",
            "name": "Chase Young",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036927",
            "name": "Pete Werner",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040155",
            "name": "Danny Stutsman",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036193",
            "name": "Anfernee Jennings",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039622",
            "name": "Isaiah Stalbird",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039425",
            "name": "Myles Cole",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036867",
            "name": "Chris Rumph II",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039388",
            "name": "Jaylan Ford",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0035402",
        "name": "Carl Granderson",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035316",
            "name": "Kaden Elliss",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035402",
            "name": "Carl Granderson",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036321",
            "name": "Chase Young",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036927",
            "name": "Pete Werner",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040155",
            "name": "Danny Stutsman",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036193",
            "name": "Anfernee Jennings",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039622",
            "name": "Isaiah Stalbird",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039425",
            "name": "Myles Cole",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036867",
            "name": "Chris Rumph II",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039388",
            "name": "Jaylan Ford",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039860",
        "name": "Kool-Aid McKinstry",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039860",
            "name": "Kool-Aid McKinstry",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040166",
            "name": "Quincy Riley",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040293",
            "name": "Michael Reid",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037250",
            "name": "Martin Emerson Jr.",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039357",
            "name": "Decamerion Richardson",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039725",
            "name": "Jayden Price",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0040166",
        "name": "Quincy Riley",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039860",
            "name": "Kool-Aid McKinstry",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040166",
            "name": "Quincy Riley",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040293",
            "name": "Michael Reid",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037250",
            "name": "Martin Emerson Jr.",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039357",
            "name": "Decamerion Richardson",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039725",
            "name": "Jayden Price",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0040643",
        "name": "Jonas Sanker",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040643",
            "name": "Jonas Sanker",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038588",
            "name": "Jordan Howden",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041089",
            "name": "Lorenzo Styles Jr.",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036253",
        "name": "Julian Blackmon",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036253",
            "name": "Julian Blackmon",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040643",
            "name": "Jonas Sanker",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0034361",
        "name": "Justin Reid",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034361",
            "name": "Justin Reid",
            "posAbb": "SS",
            "posRank": 1
          }
        ]
      }
    ]
  },
  "NYG": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0040691",
        "name": "Jaxson Dart",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040691",
            "name": "Jaxson Dart",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031503",
            "name": "Jameis Winston",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0040715",
        "name": "Cam Skattebo",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040715",
            "name": "Cam Skattebo",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033376",
            "name": "Patrick Ricard",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035250",
            "name": "Devin Singletary",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039384",
            "name": "Tyrone Tracy Jr.",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0033376",
        "name": "Patrick Ricard",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040715",
            "name": "Cam Skattebo",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033376",
            "name": "Patrick Ricard",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035250",
            "name": "Devin Singletary",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039384",
            "name": "Tyrone Tracy Jr.",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0039337",
        "name": "Malik Nabers",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039337",
            "name": "Malik Nabers",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041042",
            "name": "Malachi Fields",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036309",
            "name": "Darnell Mooney",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0041042",
        "name": "Malachi Fields",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039337",
            "name": "Malik Nabers",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041042",
            "name": "Malachi Fields",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036309",
            "name": "Darnell Mooney",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0036309",
        "name": "Darnell Mooney",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039337",
            "name": "Malik Nabers",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041042",
            "name": "Malachi Fields",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036309",
            "name": "Darnell Mooney",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0037838",
        "name": "Isaiah Likely",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037838",
            "name": "Isaiah Likely",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039847",
            "name": "Theo Johnson",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "",
            "name": "",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0036386",
        "name": "Andrew Thomas",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036386",
            "name": "Andrew Thomas",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041101",
            "name": "J.C. Davis",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0036246",
        "name": "Jon Runyan",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036246",
            "name": "Jon Runyan",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034668",
            "name": "Aaron Stinnie",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0039019",
        "name": "John Michael Schmitz Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039019",
            "name": "John Michael Schmitz Jr.",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039446",
            "name": "Bryan Hudson",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0041505",
        "name": "Francis Mauigoa",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041505",
            "name": "Francis Mauigoa",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034668",
            "name": "Aaron Stinnie",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0033290",
        "name": "Jermaine Eluemunor",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033290",
            "name": "Jermaine Eluemunor",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040181",
            "name": "Marcus Mbow",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0036982",
        "name": "Chauncey Golston",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036982",
            "name": "Chauncey Golston",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031270",
            "name": "Shelby Harris",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040694",
            "name": "Darius Alexander",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041095",
            "name": "Bobby Jamison-Travis",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032667",
            "name": "Roy Robertson-Harris",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0031270",
        "name": "Shelby Harris",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036982",
            "name": "Chauncey Golston",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031270",
            "name": "Shelby Harris",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040694",
            "name": "Darius Alexander",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041095",
            "name": "Bobby Jamison-Travis",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032667",
            "name": "Roy Robertson-Harris",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0032424",
        "name": "DJ Reader",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032424",
            "name": "DJ Reader",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039176",
            "name": "CJ Okoye",
            "posAbb": "NT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033347",
            "name": "Josh Tupou",
            "posAbb": "NT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0041509",
        "name": "Arvell Reese",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041509",
            "name": "Arvell Reese",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034673",
            "name": "Tremaine Edmunds",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040677",
            "name": "Abdul Carter",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035713",
            "name": "Brian Burns",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037611",
            "name": "Kayvon Thibodeaux",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041102",
            "name": "Jack Kelly",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037259",
            "name": "Micah McFadden",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038399",
            "name": "Zaire Barnes",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0034673",
        "name": "Tremaine Edmunds",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041509",
            "name": "Arvell Reese",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034673",
            "name": "Tremaine Edmunds",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040677",
            "name": "Abdul Carter",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035713",
            "name": "Brian Burns",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037611",
            "name": "Kayvon Thibodeaux",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041102",
            "name": "Jack Kelly",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037259",
            "name": "Micah McFadden",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038399",
            "name": "Zaire Barnes",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0036996",
        "name": "Greg Newsome II",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036996",
            "name": "Greg Newsome II",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039000",
            "name": "Deonte Banks",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041462",
            "name": "Colton Hood",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040243",
            "name": "Korie Black",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036937",
            "name": "Paulson Adebo",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039620",
            "name": "Rico Payton",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0039000",
        "name": "Deonte Banks",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036996",
            "name": "Greg Newsome II",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039000",
            "name": "Deonte Banks",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041462",
            "name": "Colton Hood",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040243",
            "name": "Korie Black",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036937",
            "name": "Paulson Adebo",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039620",
            "name": "Rico Payton",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039821",
        "name": "Dru Phillips",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039821",
            "name": "Dru Phillips",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038986",
            "name": "Nic Jones",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040471",
            "name": "Nikko Reed",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036998",
        "name": "Jevon Holland",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036998",
            "name": "Jevon Holland",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036587",
            "name": "Ar'Darius Washington",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034248",
            "name": "Elijah Campbell",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0039861",
        "name": "Tyler Nubin",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039861",
            "name": "Tyler Nubin",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036502",
            "name": "Jason Pinnock",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "NYJ": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0030565",
        "name": "Geno Smith",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0030565",
            "name": "Geno Smith",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041056",
            "name": "Cade Klubnik",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0038120",
        "name": "Breece Hall",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038120",
            "name": "Breece Hall",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039794",
            "name": "Braelon Allen",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039798",
            "name": "Isaiah Davis",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0039794",
        "name": "Braelon Allen",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038120",
            "name": "Breece Hall",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039794",
            "name": "Braelon Allen",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039798",
            "name": "Isaiah Davis",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0037740",
        "name": "Garrett Wilson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037740",
            "name": "Garrett Wilson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039890",
            "name": "Adonai Mitchell",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039451",
            "name": "Isaiah Williams",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039890",
        "name": "Adonai Mitchell",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037740",
            "name": "Garrett Wilson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039890",
            "name": "Adonai Mitchell",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039451",
            "name": "Isaiah Williams",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0039451",
        "name": "Isaiah Williams",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037740",
            "name": "Garrett Wilson",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039890",
            "name": "Adonai Mitchell",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039451",
            "name": "Isaiah Williams",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0040736",
        "name": "Mason Taylor",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040736",
            "name": "Mason Taylor",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041032",
            "name": "Kenyon Sadiq",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037805",
            "name": "Jeremy Ruckert",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0039790",
        "name": "Olu Fashanu",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039790",
            "name": "Olu Fashanu",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038114",
            "name": "Max Mitchell",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0037255",
        "name": "Dylan Parham",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037255",
            "name": "Dylan Parham",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041097",
            "name": "Anez Cooper",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0036622",
        "name": "Josh Myers",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036622",
            "name": "Josh Myers",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036604",
            "name": "Jordan Meredith",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039145",
        "name": "Joe Tippmann",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039145",
            "name": "Joe Tippmann",
            "posAbb": "RG",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0040123",
        "name": "Armand Membou",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040123",
            "name": "Armand Membou",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034768",
            "name": "Chukwuma Okorafor",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0037083",
        "name": "Kingsley Enagbare",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037083",
            "name": "Kingsley Enagbare",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039142",
            "name": "Will McDonald IV",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041026",
            "name": "David Bailey",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039284",
            "name": "Braiden McGregor",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037431",
            "name": "Kingsley Jonathan",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036902",
            "name": "Joseph Ossai",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0039142",
        "name": "Will McDonald IV",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037083",
            "name": "Kingsley Enagbare",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039142",
            "name": "Will McDonald IV",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041026",
            "name": "David Bailey",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039284",
            "name": "Braiden McGregor",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037431",
            "name": "Kingsley Jonathan",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0036902",
            "name": "Joseph Ossai",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0034782",
        "name": "Harrison Phillips",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034782",
            "name": "Harrison Phillips",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039886",
            "name": "T'Vondre Sweat",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033051",
            "name": "David Onyemata",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041549",
            "name": "Darrell Jackson Jr.",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039431",
            "name": "Jowon Briggs",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0029607",
        "name": "Demario Davis",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0029607",
            "name": "Demario Davis",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036500",
            "name": "Jamien Sherwood",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040186",
            "name": "Kiko Mauigoa",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037526",
            "name": "Marcelino McCrary-Ball",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039347",
            "name": "Trevin Wallace",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035617",
            "name": "Troy Reeder",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0036500",
        "name": "Jamien Sherwood",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0029607",
            "name": "Demario Davis",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036500",
            "name": "Jamien Sherwood",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040186",
            "name": "Kiko Mauigoa",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037526",
            "name": "Marcelino McCrary-Ball",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039347",
            "name": "Trevin Wallace",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035617",
            "name": "Troy Reeder",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0036987",
        "name": "Brandon Stephens",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036987",
            "name": "Brandon Stephens",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036986",
            "name": "Nahshon Wright",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040133",
            "name": "Azareye'h Thomas",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039789",
            "name": "Qwan'tez Stiggers",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036885",
            "name": "Tre Brown",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0036986",
        "name": "Nahshon Wright",
        "grade": "Average",
        "rating": 70,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036987",
            "name": "Brandon Stephens",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036986",
            "name": "Nahshon Wright",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040133",
            "name": "Azareye'h Thomas",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039789",
            "name": "Qwan'tez Stiggers",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036885",
            "name": "Tre Brown",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039372",
        "name": "Jarvis Brownlee Jr.",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039372",
            "name": "Jarvis Brownlee Jr.",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041038",
            "name": "D'Angelo Ponds",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038123",
            "name": "Dane Belton",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0040165",
        "name": "Malachi Moore",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Minkah Fitzpatrick (Out)",
        "candidates": [
          {
            "gsis_id": "00-0034789",
            "name": "Minkah Fitzpatrick",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040165",
            "name": "Malachi Moore",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041120",
            "name": "VJ Payne",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0038123",
        "name": "Dane Belton",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038123",
            "name": "Dane Belton",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036941",
            "name": "Andre Cisco",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "PHI": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0036389",
        "name": "Jalen Hurts",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036389",
            "name": "Jalen Hurts",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0027973",
            "name": "Andy Dalton",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038400",
            "name": "Tanner McKee",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0034844",
        "name": "Saquon Barkley",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034844",
            "name": "Saquon Barkley",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038555",
            "name": "Tank Bigsby",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039746",
            "name": "Will Shipley",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0038555",
        "name": "Tank Bigsby",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034844",
            "name": "Saquon Barkley",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038555",
            "name": "Tank Bigsby",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039746",
            "name": "Will Shipley",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0036912",
        "name": "DeVonta Smith",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036912",
            "name": "DeVonta Smith",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038393",
            "name": "Dontayvion Wicks",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040867",
            "name": "Makai Lemon",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038393",
        "name": "Dontayvion Wicks",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036912",
            "name": "DeVonta Smith",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038393",
            "name": "Dontayvion Wicks",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040867",
            "name": "Makai Lemon",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0040867",
        "name": "Makai Lemon",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036912",
            "name": "DeVonta Smith",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038393",
            "name": "Dontayvion Wicks",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040867",
            "name": "Makai Lemon",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0034351",
        "name": "Dallas Goedert",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034351",
            "name": "Dallas Goedert",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033246",
            "name": "Johnny Mundt",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038498",
            "name": "E.J. Jenkins",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0034429",
        "name": "Jordan Mailata",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034429",
            "name": "Jordan Mailata",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041554",
            "name": "Markel Bell",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0040631",
        "name": "Willie Lampkin",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040631",
            "name": "Willie Lampkin",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037002",
            "name": "Landon Dickerson",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0038112",
        "name": "Cam Jurgens",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038112",
            "name": "Cam Jurgens",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040587",
            "name": "Drew Kendall",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039001",
        "name": "Tyler Steen",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039001",
            "name": "Tyler Steen",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040897",
            "name": "Micah Morris",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0030561",
        "name": "Lane Johnson",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0030561",
            "name": "Lane Johnson",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034951",
            "name": "Fred Johnson",
            "posAbb": "RT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041554",
            "name": "Markel Bell",
            "posAbb": "RT",
            "posRank": 3
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0038386",
        "name": "Jalen Carter",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038386",
            "name": "Jalen Carter",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038412",
            "name": "Moro Ojomo",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038978",
            "name": "Byron Young",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040662",
            "name": "Ty Robinson",
            "posAbb": "RDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0038412",
        "name": "Moro Ojomo",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038386",
            "name": "Jalen Carter",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038412",
            "name": "Moro Ojomo",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038978",
            "name": "Byron Young",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040662",
            "name": "Ty Robinson",
            "posAbb": "RDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "",
        "name": "",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "",
            "name": "",
            "posAbb": "NT",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0036418",
        "name": "Zack Baun",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036418",
            "name": "Zack Baun",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040708",
            "name": "Jihaad Campbell",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039013",
            "name": "Nolan Smith Jr.",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036224",
            "name": "Jonathan Greenard",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039740",
            "name": "Jalyx Hunt",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036192",
            "name": "AJ Epenesa",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040013",
            "name": "Smael Mondon Jr.",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039826",
            "name": "Jeremiah Trotter Jr.",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038116",
            "name": "Arnold Ebiketie",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0040708",
        "name": "Jihaad Campbell",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036418",
            "name": "Zack Baun",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040708",
            "name": "Jihaad Campbell",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039013",
            "name": "Nolan Smith Jr.",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036224",
            "name": "Jonathan Greenard",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039740",
            "name": "Jalyx Hunt",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036192",
            "name": "AJ Epenesa",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040013",
            "name": "Smael Mondon Jr.",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039826",
            "name": "Jeremiah Trotter Jr.",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038116",
            "name": "Arnold Ebiketie",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039888",
        "name": "Quinyon Mitchell",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039888",
            "name": "Quinyon Mitchell",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037079",
            "name": "Riq Woolen",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032580",
            "name": "Jonathan Jones",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039140",
            "name": "Kelee Ringo",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039072",
            "name": "Jakorian Bennett",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0037079",
        "name": "Riq Woolen",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039888",
            "name": "Quinyon Mitchell",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037079",
            "name": "Riq Woolen",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032580",
            "name": "Jonathan Jones",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039140",
            "name": "Kelee Ringo",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039072",
            "name": "Jakorian Bennett",
            "posAbb": "LCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0039841",
        "name": "Cooper DeJean",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039841",
            "name": "Cooper DeJean",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040071",
            "name": "Mac McWilliams",
            "posAbb": "NB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0040749",
        "name": "Andrew Mukuba",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040749",
            "name": "Andrew Mukuba",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039841",
            "name": "Cooper DeJean",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040923",
            "name": "Maximus Pulley",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0034993",
        "name": "Marcus Epps",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034993",
            "name": "Marcus Epps",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036501",
            "name": "Michael Carter II",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040929",
            "name": "Tucker Large",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "PIT": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0023459",
        "name": "Aaron Rodgers",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0023459",
            "name": "Aaron Rodgers",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034771",
            "name": "Mason Rudolph",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040203",
            "name": "Will Howard",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0037228",
        "name": "Jaylen Warren",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037228",
            "name": "Jaylen Warren",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041398",
            "name": "Riley Nowakowski",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036139",
            "name": "Rico Dowdle",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041490",
            "name": "Eli Heidenreich",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0041398",
        "name": "Riley Nowakowski",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037228",
            "name": "Jaylen Warren",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041398",
            "name": "Riley Nowakowski",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036139",
            "name": "Rico Dowdle",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041490",
            "name": "Eli Heidenreich",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0035640",
        "name": "DK Metcalf",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035640",
            "name": "DK Metcalf",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036252",
            "name": "Michael Pittman Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039739",
            "name": "Roman Wilson",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0039739",
        "name": "Roman Wilson",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Michael Pittman Jr. (Out)",
        "candidates": [
          {
            "gsis_id": "00-0035640",
            "name": "DK Metcalf",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036252",
            "name": "Michael Pittman Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039739",
            "name": "Roman Wilson",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0038558",
        "name": "Darnell Washington",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038558",
            "name": "Darnell Washington",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036894",
            "name": "Pat Freiermuth",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033757",
            "name": "Robert Tonyan",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0039871",
        "name": "Troy Fautanu",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039871",
            "name": "Troy Fautanu",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037480",
            "name": "Dylan Cook",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036396",
            "name": "Jack Driscoll",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0039358",
        "name": "Mason McCormick",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039358",
            "name": "Mason McCormick",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041396",
            "name": "Gennings Dunker",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0039896",
        "name": "Zach Frazier",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039896",
            "name": "Zach Frazier",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036783",
            "name": "Ryan McCollum",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0038645",
        "name": "Spencer Anderson",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038645",
            "name": "Spencer Anderson",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037336",
            "name": "Brock Hoffman",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0037480",
        "name": "Dylan Cook",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037480",
            "name": "Dylan Cook",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041482",
            "name": "Max Iheanachor",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0027969",
        "name": "Cameron Heyward",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0027969",
            "name": "Cameron Heyward",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040678",
            "name": "Derrick Harmon",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040188",
            "name": "Yahya Black",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "",
            "name": "Gabriel Rubio",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041261",
            "name": "Kevin Jobity Jr.",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039389",
            "name": "Logan Lee",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0040678",
        "name": "Derrick Harmon",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0027969",
            "name": "Cameron Heyward",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040678",
            "name": "Derrick Harmon",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040188",
            "name": "Yahya Black",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "",
            "name": "Gabriel Rubio",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041261",
            "name": "Kevin Jobity Jr.",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039389",
            "name": "Logan Lee",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0039110",
        "name": "Keeanu Benton",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039110",
            "name": "Keeanu Benton",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034810",
            "name": "Sebastian Joseph-Day",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0036323",
        "name": "Patrick Queen",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036323",
            "name": "Patrick Queen",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039741",
            "name": "Payton Wilson",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036333",
            "name": "Alex Highsmith",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033886",
            "name": "T.J. Watt",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038577",
            "name": "Nick Herbig",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040160",
            "name": "Jack Sawyer",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035286",
            "name": "Cole Holcomb",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040231",
            "name": "Carson Bruener",
            "posAbb": "RILB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0039741",
        "name": "Payton Wilson",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036323",
            "name": "Patrick Queen",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039741",
            "name": "Payton Wilson",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036333",
            "name": "Alex Highsmith",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033886",
            "name": "T.J. Watt",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038577",
            "name": "Nick Herbig",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040160",
            "name": "Jack Sawyer",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035286",
            "name": "Cole Holcomb",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040231",
            "name": "Carson Bruener",
            "posAbb": "RILB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0035699",
        "name": "Jamel Dean",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035699",
            "name": "Jamel Dean",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039167",
            "name": "Joey Porter Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036617",
            "name": "Asante Samuel Jr.",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041393",
            "name": "Daylen Everette",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040341",
            "name": "Doneiko Slaughter",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039883",
            "name": "Daequan Hardy",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0036617",
        "name": "Asante Samuel Jr.",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Joey Porter Jr. (Out)",
        "candidates": [
          {
            "gsis_id": "00-0035699",
            "name": "Jamel Dean",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039167",
            "name": "Joey Porter Jr.",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036617",
            "name": "Asante Samuel Jr.",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041393",
            "name": "Daylen Everette",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040341",
            "name": "Doneiko Slaughter",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039883",
            "name": "Daequan Hardy",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0033055",
        "name": "Jalen Ramsey",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033055",
            "name": "Jalen Ramsey",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036504",
            "name": "Brandin Echols",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040232",
            "name": "Donte Kent",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0038135",
        "name": "Jaquan Brisker",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038135",
            "name": "Jaquan Brisker",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041401",
            "name": "Robert Spears-Jennings",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0033941",
        "name": "Rayshawn Jenkins",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033941",
            "name": "Rayshawn Jenkins",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034277",
            "name": "DeShon Elliott",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "SEA": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0035704",
        "name": "Drew Lock",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Sam Darnold (Out)",
        "candidates": [
          {
            "gsis_id": "00-0034869",
            "name": "Sam Darnold",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035704",
            "name": "Drew Lock",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040673",
            "name": "Jalen Milroe",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0041512",
        "name": "Jadarian Price",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041512",
            "name": "Jadarian Price",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038488",
            "name": "Brady Russell",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039299",
            "name": "George Holani",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040649",
            "name": "Robbie Ouzts",
            "posAbb": "FB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038797",
            "name": "Emanuel Wilson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0038488",
        "name": "Brady Russell",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041512",
            "name": "Jadarian Price",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038488",
            "name": "Brady Russell",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039299",
            "name": "George Holani",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040649",
            "name": "Robbie Ouzts",
            "posAbb": "FB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038797",
            "name": "Emanuel Wilson",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0038543",
        "name": "Jaxon Smith-Njigba",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038543",
            "name": "Jaxon Smith-Njigba",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037545",
            "name": "Rashid Shaheed",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033908",
            "name": "Cooper Kupp",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0037545",
        "name": "Rashid Shaheed",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038543",
            "name": "Jaxon Smith-Njigba",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037545",
            "name": "Rashid Shaheed",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033908",
            "name": "Cooper Kupp",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0033908",
        "name": "Cooper Kupp",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038543",
            "name": "Jaxon Smith-Njigba",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037545",
            "name": "Rashid Shaheed",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033908",
            "name": "Cooper Kupp",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0039793",
        "name": "AJ Barner",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039793",
            "name": "AJ Barner",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033576",
            "name": "Eric Saubert",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040739",
            "name": "Elijah Arroyo",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0037821",
        "name": "Charles Cross",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037821",
            "name": "Charles Cross",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036363",
            "name": "Josh Jones",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0040639",
        "name": "Grey Zabel",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040639",
            "name": "Grey Zabel",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040882",
            "name": "Beau Stephens",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040652",
            "name": "Mason Richman",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0039926",
        "name": "Jalen Sundell",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039926",
            "name": "Jalen Sundell",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038593",
            "name": "Olu Oluwatimi",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039020",
        "name": "Anthony Bradford",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039020",
            "name": "Anthony Bradford",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039839",
            "name": "Christian Haynes",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0037812",
        "name": "Abraham Lucas",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037812",
            "name": "Abraham Lucas",
            "posAbb": "RT",
            "posRank": 1
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0031933",
        "name": "Leonard Williams",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031933",
            "name": "Leonard Williams",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032387",
            "name": "Jarran Reed",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040647",
            "name": "Rylie Mills",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038591",
            "name": "Mike Morris",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0032387",
        "name": "Jarran Reed",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031933",
            "name": "Leonard Williams",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032387",
            "name": "Jarran Reed",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040647",
            "name": "Rylie Mills",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038591",
            "name": "Mike Morris",
            "posAbb": "LDE",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0039309",
        "name": "Byron Murphy II",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039309",
            "name": "Byron Murphy II",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038694",
            "name": "Brandon Pili",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0038922",
        "name": "Drake Thomas",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038922",
            "name": "Drake Thomas",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031411",
            "name": "DeMarcus Lawrence",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034350",
            "name": "Uchenna Nwosu",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036994",
            "name": "Ernest Jones IV",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039047",
            "name": "Derick Hall",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039815",
            "name": "Tyrice Knight",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038764",
            "name": "Patrick O'Connell",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032052",
            "name": "Dante Fowler Jr.",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037003",
            "name": "Chazz Surratt",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040061",
            "name": "Connor O'Toole",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0031411",
        "name": "DeMarcus Lawrence",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038922",
            "name": "Drake Thomas",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031411",
            "name": "DeMarcus Lawrence",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034350",
            "name": "Uchenna Nwosu",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036994",
            "name": "Ernest Jones IV",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039047",
            "name": "Derick Hall",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039815",
            "name": "Tyrice Knight",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038764",
            "name": "Patrick O'Connell",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032052",
            "name": "Dante Fowler Jr.",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037003",
            "name": "Chazz Surratt",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040061",
            "name": "Connor O'Toole",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039169",
        "name": "Devon Witherspoon",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039169",
            "name": "Devon Witherspoon",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037137",
            "name": "Josh Jobe",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039795",
            "name": "Nehemiah Pritchett",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040873",
            "name": "Julian Neal",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041382",
            "name": "Avery Smith",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039903",
            "name": "Terrion Arnold",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0037137",
        "name": "Josh Jobe",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039169",
            "name": "Devon Witherspoon",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037137",
            "name": "Josh Jobe",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039795",
            "name": "Nehemiah Pritchett",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040873",
            "name": "Julian Neal",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041382",
            "name": "Avery Smith",
            "posAbb": "LCB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039903",
            "name": "Terrion Arnold",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0040733",
        "name": "Nick Emmanwori",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040733",
            "name": "Nick Emmanwori",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0034974",
        "name": "Julian Love",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034974",
            "name": "Julian Love",
            "posAbb": "FS",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0037323",
        "name": "Rodney Thomas II",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Ty Okada (Out)",
        "candidates": [
          {
            "gsis_id": "00-0038765",
            "name": "Ty Okada",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037323",
            "name": "Rodney Thomas II",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038866",
            "name": "AJ Finley",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "SF": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0037834",
        "name": "Brock Purdy",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037834",
            "name": "Brock Purdy",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036972",
            "name": "Mac Jones",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040589",
            "name": "Kurtis Rourke",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0033280",
        "name": "Christian McCaffrey",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033280",
            "name": "Christian McCaffrey",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0029892",
            "name": "Kyle Juszczyk",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041052",
            "name": "Kaelon Black",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040177",
            "name": "Jordan James",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0029892",
        "name": "Kyle Juszczyk",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033280",
            "name": "Christian McCaffrey",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0029892",
            "name": "Kyle Juszczyk",
            "posAbb": "FB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041052",
            "name": "Kaelon Black",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040177",
            "name": "Jordan James",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0031408",
        "name": "Mike Evans",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031408",
            "name": "Mike Evans",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035719",
            "name": "Deebo Samuel",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032775",
            "name": "Demarcus Robinson",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0035719",
        "name": "Deebo Samuel",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031408",
            "name": "Mike Evans",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035719",
            "name": "Deebo Samuel",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032775",
            "name": "Demarcus Robinson",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0032775",
        "name": "Demarcus Robinson",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0031408",
            "name": "Mike Evans",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035719",
            "name": "Deebo Samuel",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0032775",
            "name": "Demarcus Robinson",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0033288",
        "name": "George Kittle",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033288",
            "name": "George Kittle",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036887",
            "name": "Luke Farrell",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038643",
            "name": "Brayden Willis",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0027857",
        "name": "Trent Williams",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0027857",
            "name": "Trent Williams",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037287",
            "name": "Vederian Lowe",
            "posAbb": "LT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041090",
            "name": "Enrique Cruz Jr.",
            "posAbb": "LT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0040245",
        "name": "Connor Colby",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040245",
            "name": "Connor Colby",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041061",
            "name": "Carver Willis",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037831",
            "name": "Nick Zakelj",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0032701",
        "name": "Jake Brendel",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0032701",
            "name": "Jake Brendel",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038615",
            "name": "Jarrett Patterson",
            "posAbb": "C",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035743",
            "name": "Brett Toth",
            "posAbb": "C",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039351",
        "name": "Dominick Puni",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039351",
            "name": "Dominick Puni",
            "posAbb": "RG",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0036256",
        "name": "Colton McKivitz",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036256",
            "name": "Colton McKivitz",
            "posAbb": "RT",
            "posRank": 1
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0035717",
        "name": "Nick Bosa",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035717",
            "name": "Nick Bosa",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039148",
            "name": "Keion White",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041556",
            "name": "Romello Height",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036341",
            "name": "Khalid Kareem",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037602",
            "name": "Sam Okuayinonu",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0034807",
            "name": "Ogbo Okoronkwo",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0039148",
        "name": "Keion White",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035717",
            "name": "Nick Bosa",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039148",
            "name": "Keion White",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041556",
            "name": "Romello Height",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036341",
            "name": "Khalid Kareem",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037602",
            "name": "Sam Okuayinonu",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0034807",
            "name": "Ogbo Okoronkwo",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0036942",
        "name": "Osa Odighizuwa",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036942",
            "name": "Osa Odighizuwa",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041557",
            "name": "Gracen Halton",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040711",
            "name": "C.J. West",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "THO581952",
            "name": "James Thompson Jr.",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040721",
            "name": "Alfred Collins",
            "posAbb": "RDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0034815",
        "name": "Fred Warner",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034815",
            "name": "Fred Warner",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034982",
            "name": "Dre Greenlaw",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035413",
            "name": "Luke Gifford",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041078",
            "name": "Jaden Dugger",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036844",
            "name": "Garret Wallow",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039435",
            "name": "Tatum Bethune",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040135",
            "name": "Nick Martin",
            "posAbb": "MLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0034982",
        "name": "Dre Greenlaw",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034815",
            "name": "Fred Warner",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034982",
            "name": "Dre Greenlaw",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035413",
            "name": "Luke Gifford",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041078",
            "name": "Jaden Dugger",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036844",
            "name": "Garret Wallow",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039435",
            "name": "Tatum Bethune",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040135",
            "name": "Nick Martin",
            "posAbb": "MLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039345",
        "name": "Renardo Green",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039345",
            "name": "Renardo Green",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036563",
            "name": "Deommodore Lenoir",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038039",
            "name": "Jack Jones",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041068",
            "name": "Ephesians Prysock",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036871",
            "name": "Nate Hobbs",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0036563",
        "name": "Deommodore Lenoir",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039345",
            "name": "Renardo Green",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036563",
            "name": "Deommodore Lenoir",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038039",
            "name": "Jack Jones",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041068",
            "name": "Ephesians Prysock",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036871",
            "name": "Nate Hobbs",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0040152",
        "name": "Upton Stout",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040152",
            "name": "Upton Stout",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0038554",
        "name": "Ji'Ayir Brown",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038554",
            "name": "Ji'Ayir Brown",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034391",
            "name": "Siran Neal",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036638",
            "name": "Darrick Forrest",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0039360",
        "name": "Malik Mustapha",
        "grade": "Below Avg",
        "rating": 69,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039360",
            "name": "Malik Mustapha",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040185",
            "name": "Marques Sigle",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036329",
            "name": "Ashtyn Davis",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "TB": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0034855",
        "name": "Baker Mayfield",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034855",
            "name": "Baker Mayfield",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041251",
            "name": "Jalon Daniels",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0039361",
        "name": "Bucky Irving",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039361",
            "name": "Bucky Irving",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036919",
            "name": "Kenny Gainwell",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038951",
            "name": "Sean Tucker",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0036919",
        "name": "Kenny Gainwell",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039361",
            "name": "Bucky Irving",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036919",
            "name": "Kenny Gainwell",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038951",
            "name": "Sean Tucker",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0040129",
        "name": "Emeka Egbuka",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040129",
            "name": "Emeka Egbuka",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033921",
            "name": "Chris Godwin Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039855",
            "name": "Jalen McMillan",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0033921",
        "name": "Chris Godwin Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040129",
            "name": "Emeka Egbuka",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033921",
            "name": "Chris Godwin Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039855",
            "name": "Jalen McMillan",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0039855",
        "name": "Jalen McMillan",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040129",
            "name": "Emeka Egbuka",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033921",
            "name": "Chris Godwin Jr.",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039855",
            "name": "Jalen McMillan",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0038129",
        "name": "Cade Otton",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038129",
            "name": "Cade Otton",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039050",
            "name": "Payne Durham",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037311",
            "name": "Ko Kieft",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0036406",
        "name": "Tristan Wirfs",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036406",
            "name": "Tristan Wirfs",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040417",
            "name": "Benjamin Chukwuma",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0036132",
        "name": "Ben Bredeson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036132",
            "name": "Ben Bredeson",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041082",
            "name": "Billy Schrauth",
            "posAbb": "LG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0039905",
        "name": "Graham Barton",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039905",
            "name": "Graham Barton",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033910",
            "name": "Dan Feeney",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0039157",
        "name": "Cody Mauch",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039157",
            "name": "Cody Mauch",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038818",
            "name": "Luke Haggard",
            "posAbb": "RG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033910",
            "name": "Dan Feeney",
            "posAbb": "RG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0037835",
        "name": "Luke Goedeke",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037835",
            "name": "Luke Goedeke",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034989",
            "name": "Justin Skule",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0039063",
        "name": "Calijah Kancey",
        "grade": "Average",
        "rating": 77,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039063",
            "name": "Calijah Kancey",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032889",
            "name": "A'Shawn Robinson",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040183",
            "name": "Elijah Roberts",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041079",
            "name": "DeMonte Capehart",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041339",
            "name": "Deshawn McKnight",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0032889",
        "name": "A'Shawn Robinson",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039063",
            "name": "Calijah Kancey",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032889",
            "name": "A'Shawn Robinson",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040183",
            "name": "Elijah Roberts",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041079",
            "name": "DeMonte Capehart",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041339",
            "name": "Deshawn McKnight",
            "posAbb": "LDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0034773",
        "name": "Vita Vea",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034773",
            "name": "Vita Vea",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031957",
            "name": "Rakeem Nunez-Roches",
            "posAbb": "NT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040384",
            "name": "Elijah Simmons",
            "posAbb": "NT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0033914",
        "name": "Alex Anzalone",
        "grade": "Above Avg",
        "rating": 84,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033914",
            "name": "Alex Anzalone",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041502",
            "name": "Josiah Trotter",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041031",
            "name": "Rueben Bain Jr.",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039068",
            "name": "Yaya Diaby",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033964",
            "name": "Al-Quadin Muhammad",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035254",
            "name": "Anthony Nelson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039049",
            "name": "SirVocea Dennis",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035942",
            "name": "Christian Rozeboom",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039877",
            "name": "Mohamed Kamara",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040158",
            "name": "David Walker",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0041502",
        "name": "Josiah Trotter",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0033914",
            "name": "Alex Anzalone",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041502",
            "name": "Josiah Trotter",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041031",
            "name": "Rueben Bain Jr.",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039068",
            "name": "Yaya Diaby",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033964",
            "name": "Al-Quadin Muhammad",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035254",
            "name": "Anthony Nelson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039049",
            "name": "SirVocea Dennis",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035942",
            "name": "Christian Rozeboom",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039877",
            "name": "Mohamed Kamara",
            "posAbb": "WLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040158",
            "name": "David Walker",
            "posAbb": "SLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0037268",
        "name": "Zyon McCollum",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037268",
            "name": "Zyon McCollum",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040747",
            "name": "Benjamin Morrison",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041253",
            "name": "Ayden Garnes",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039051",
            "name": "Josh Hayes",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0040747",
        "name": "Benjamin Morrison",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037268",
            "name": "Zyon McCollum",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040747",
            "name": "Benjamin Morrison",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041253",
            "name": "Ayden Garnes",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039051",
            "name": "Josh Hayes",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0040143",
        "name": "Jacob Parrish",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040143",
            "name": "Jacob Parrish",
            "posAbb": "NB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041057",
            "name": "Keionte Scott",
            "posAbb": "NB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040089",
            "name": "Kevin Knowles",
            "posAbb": "NB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0036411",
        "name": "Antoine Winfield Jr.",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036411",
            "name": "Antoine Winfield Jr.",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036993",
            "name": "Ifeatu Melifonwu",
            "posAbb": "FS",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0039846",
        "name": "Tykee Smith",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039846",
            "name": "Tykee Smith",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032399",
            "name": "Miles Killebrew",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  },
  "TEN": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0040676",
        "name": "Cam Ward",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040676",
            "name": "Cam Ward",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033869",
            "name": "Mitchell Trubisky",
            "posAbb": "QB",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0035261",
        "name": "Tony Pollard",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035261",
            "name": "Tony Pollard",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039032",
            "name": "Tyjae Spears",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037594",
            "name": "Julius Chestnut",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0039032",
        "name": "Tyjae Spears",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035261",
            "name": "Tony Pollard",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039032",
            "name": "Tyjae Spears",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037594",
            "name": "Julius Chestnut",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0041438",
        "name": "Carnell Tate",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041438",
            "name": "Carnell Tate",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038117",
            "name": "Wan'Dale Robinson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034837",
            "name": "Calvin Ridley",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0038117",
        "name": "Wan'Dale Robinson",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041438",
            "name": "Carnell Tate",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038117",
            "name": "Wan'Dale Robinson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034837",
            "name": "Calvin Ridley",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0034837",
        "name": "Calvin Ridley",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041438",
            "name": "Carnell Tate",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038117",
            "name": "Wan'Dale Robinson",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034837",
            "name": "Calvin Ridley",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0040584",
        "name": "Gunnar Helm",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040584",
            "name": "Gunnar Helm",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038115",
            "name": "Daniel Bellinger",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036876",
            "name": "Kylen Granson",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0036869",
        "name": "Dan Moore Jr.",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036869",
            "name": "Dan Moore Jr.",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036866",
            "name": "James Hudson III",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0039034",
        "name": "Peter Skoronski",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039034",
            "name": "Peter Skoronski",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040881",
            "name": "Fernando Carmona",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038586",
            "name": "Atonio Mafi",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0034112",
        "name": "Austin Schlottmann",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034112",
            "name": "Austin Schlottmann",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040893",
            "name": "Pat Coogan",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0040881",
        "name": "Fernando Carmona",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040881",
            "name": "Fernando Carmona",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040190",
            "name": "Jackson Slater",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0039731",
        "name": "JC Latham",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039731",
            "name": "JC Latham",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040512",
            "name": "Brandon Crenshaw-Dickson",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0037663",
        "name": "Jermaine Johnson II",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037663",
            "name": "Jermaine Johnson II",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034805",
            "name": "John Franklin-Myers",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034163",
            "name": "Jacob Martin",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041508",
            "name": "Keldric Faulk",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040752",
            "name": "Oluwafemi Oladejo",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038514",
            "name": "Truman Jones",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0034805",
        "name": "John Franklin-Myers",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037663",
            "name": "Jermaine Johnson II",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034805",
            "name": "John Franklin-Myers",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034163",
            "name": "Jacob Martin",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041508",
            "name": "Keldric Faulk",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040752",
            "name": "Oluwafemi Oladejo",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0038514",
            "name": "Truman Jones",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0035643",
        "name": "Jeffery Simmons",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035643",
            "name": "Jeffery Simmons",
            "posAbb": "LDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036266",
            "name": "Jordan Elliott",
            "posAbb": "RDT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033870",
            "name": "Solomon Thomas",
            "posAbb": "RDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040892",
            "name": "Jackie Marshall",
            "posAbb": "LDT",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040041",
            "name": "Nazir Stackhouse",
            "posAbb": "LDT",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0039858",
        "name": "Cedric Gray",
        "grade": "Average",
        "rating": 73,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039858",
            "name": "Cedric Gray",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041479",
            "name": "Anthony Hill Jr.",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039430",
            "name": "James Williams Sr.",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035672",
            "name": "Cody Barton",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038600",
            "name": "Owen Pappoe",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040503",
            "name": "Dorian Mausi",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036511",
            "name": "Milo Eifler",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0041479",
        "name": "Anthony Hill Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039858",
            "name": "Cedric Gray",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041479",
            "name": "Anthony Hill Jr.",
            "posAbb": "MLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039430",
            "name": "James Williams Sr.",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035672",
            "name": "Cody Barton",
            "posAbb": "MLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038600",
            "name": "Owen Pappoe",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040503",
            "name": "Dorian Mausi",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036511",
            "name": "Milo Eifler",
            "posAbb": "WLB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0038121",
        "name": "Alontae Taylor",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038121",
            "name": "Alontae Taylor",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037758",
            "name": "Cor'Dale Flott",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040020",
            "name": "Micah Robinson",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038407",
            "name": "Jaylon Jones",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038043",
            "name": "Joshua Williams",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0037758",
        "name": "Cor'Dale Flott",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0038121",
            "name": "Alontae Taylor",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037758",
            "name": "Cor'Dale Flott",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040020",
            "name": "Micah Robinson",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038407",
            "name": "Jaylon Jones",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038043",
            "name": "Joshua Williams",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0040201",
        "name": "Marcus Harris",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040201",
            "name": "Marcus Harris",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0040141",
        "name": "Kevin Winston Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040141",
            "name": "Kevin Winston Jr.",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037155",
            "name": "Tony Adams",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0036421",
            "name": "Terrell Burgess",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0035632",
        "name": "Amani Hooker",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035632",
            "name": "Amani Hooker",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0038620",
            "name": "Erick Hallett II",
            "posAbb": "SS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038703",
            "name": "Kendell Brooks",
            "posAbb": "SS",
            "posRank": 3
          }
        ]
      }
    ]
  },
  "WAS": {
    "offense": [
      {
        "pos": "QB",
        "gsis_id": "00-0039910",
        "name": "Jayden Daniels",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039910",
            "name": "Jayden Daniels",
            "posAbb": "QB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032268",
            "name": "Marcus Mariota",
            "posAbb": "QB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041117",
            "name": "Athan Kaliakmanis",
            "posAbb": "QB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB1",
        "gsis_id": "00-0040242",
        "name": "Jacory Croskey-Merritt",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040242",
            "name": "Jacory Croskey-Merritt",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037256",
            "name": "Rachaad White",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041096",
            "name": "Kaytron Allen",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "RB2",
        "gsis_id": "00-0037256",
        "name": "Rachaad White",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040242",
            "name": "Jacory Croskey-Merritt",
            "posAbb": "RB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0037256",
            "name": "Rachaad White",
            "posAbb": "RB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041096",
            "name": "Kaytron Allen",
            "posAbb": "RB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR1",
        "gsis_id": "00-0035659",
        "name": "Terry McLaurin",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035659",
            "name": "Terry McLaurin",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031588",
            "name": "Stefon Diggs",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041040",
            "name": "Antonio Williams",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR2",
        "gsis_id": "00-0031588",
        "name": "Stefon Diggs",
        "grade": "Average",
        "rating": 75,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035659",
            "name": "Terry McLaurin",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031588",
            "name": "Stefon Diggs",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041040",
            "name": "Antonio Williams",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "WR3",
        "gsis_id": "00-0041040",
        "name": "Antonio Williams",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035659",
            "name": "Terry McLaurin",
            "posAbb": "WR",
            "posRank": 1
          },
          {
            "gsis_id": "00-0031588",
            "name": "Stefon Diggs",
            "posAbb": "WR",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041040",
            "name": "Antonio Williams",
            "posAbb": "WR",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "TE",
        "gsis_id": "00-0036628",
        "name": "John Bates",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "starter_reason": "promoted after: Chig Okonkwo (Out)",
        "candidates": [
          {
            "gsis_id": "00-0037809",
            "name": "Chig Okonkwo",
            "posAbb": "TE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036628",
            "name": "John Bates",
            "posAbb": "TE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039912",
            "name": "Ben Sinnott",
            "posAbb": "TE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LT",
        "gsis_id": "00-0039913",
        "name": "Brandon Coleman",
        "grade": "Above Avg",
        "rating": 86,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039913",
            "name": "Brandon Coleman",
            "posAbb": "LT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0032380",
            "name": "Laremy Tunsil",
            "posAbb": "LT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LG",
        "gsis_id": "00-0037092",
        "name": "Chris Paul",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037092",
            "name": "Chris Paul",
            "posAbb": "LG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041183",
            "name": "Tanoa Togiai",
            "posAbb": "LG",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033082",
            "name": "Lucas Patrick",
            "posAbb": "LG",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "C",
        "gsis_id": "00-0035149",
        "name": "Nick Allegretti",
        "grade": "Above Avg",
        "rating": 87,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0035149",
            "name": "Nick Allegretti",
            "posAbb": "C",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041108",
            "name": "Matt Gulbin",
            "posAbb": "C",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RG",
        "gsis_id": "00-0036618",
        "name": "Sam Cosmi",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036618",
            "name": "Sam Cosmi",
            "posAbb": "RG",
            "posRank": 1
          },
          {
            "gsis_id": "00-0041183",
            "name": "Tanoa Togiai",
            "posAbb": "RG",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "RT",
        "gsis_id": "00-0040686",
        "name": "Josh Conerly Jr.",
        "grade": "Average",
        "rating": 71,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0040686",
            "name": "Josh Conerly Jr.",
            "posAbb": "RT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033831",
            "name": "Andrew Wylie",
            "posAbb": "RT",
            "posRank": 2
          }
        ]
      }
    ],
    "defense": [
      {
        "pos": "EDGE1",
        "gsis_id": "00-0036260",
        "name": "Javon Kinlaw",
        "grade": "Average",
        "rating": 74,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036260",
            "name": "Javon Kinlaw",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034397",
            "name": "Tim Settle",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035279",
            "name": "Charles Omenihu",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035409",
            "name": "Shy Tuttle",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039906",
            "name": "Jer'Zhan Newton",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0033947",
            "name": "Deatrich Wise Jr.",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "EDGE2",
        "gsis_id": "00-0034397",
        "name": "Tim Settle",
        "grade": "Average",
        "rating": 70,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036260",
            "name": "Javon Kinlaw",
            "posAbb": "RDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034397",
            "name": "Tim Settle",
            "posAbb": "LDE",
            "posRank": 1
          },
          {
            "gsis_id": "00-0035279",
            "name": "Charles Omenihu",
            "posAbb": "RDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0035409",
            "name": "Shy Tuttle",
            "posAbb": "LDE",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039906",
            "name": "Jer'Zhan Newton",
            "posAbb": "LDE",
            "posRank": 3
          },
          {
            "gsis_id": "00-0033947",
            "name": "Deatrich Wise Jr.",
            "posAbb": "RDE",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "DT",
        "gsis_id": "00-0034333",
        "name": "Daron Payne",
        "grade": "Above Avg",
        "rating": 78,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034333",
            "name": "Daron Payne",
            "posAbb": "NT",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040314",
            "name": "Ricky Barber",
            "posAbb": "NT",
            "posRank": 2
          }
        ]
      },
      {
        "pos": "LB1",
        "gsis_id": "00-0041028",
        "name": "Sonny Styles",
        "grade": "Above Avg",
        "rating": 79,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041028",
            "name": "Sonny Styles",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036940",
            "name": "Odafe Oweh",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034302",
            "name": "Frankie Luvu",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034373",
            "name": "Dorance Armstrong",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036286",
            "name": "K'Lavon Chaisson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037819",
            "name": "Leo Chenal",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041074",
            "name": "Joshua Josephs",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040216",
            "name": "Kain Medrano",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039368",
            "name": "Jordan Magee",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039412",
            "name": "Javontae Jean-Baptiste",
            "posAbb": "SLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040318",
            "name": "Ale Kaho",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "LB2",
        "gsis_id": "00-0036940",
        "name": "Odafe Oweh",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0041028",
            "name": "Sonny Styles",
            "posAbb": "RILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036940",
            "name": "Odafe Oweh",
            "posAbb": "WLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034302",
            "name": "Frankie Luvu",
            "posAbb": "LILB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0034373",
            "name": "Dorance Armstrong",
            "posAbb": "SLB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0036286",
            "name": "K'Lavon Chaisson",
            "posAbb": "SLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0037819",
            "name": "Leo Chenal",
            "posAbb": "RILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0041074",
            "name": "Joshua Josephs",
            "posAbb": "WLB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0040216",
            "name": "Kain Medrano",
            "posAbb": "LILB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0039368",
            "name": "Jordan Magee",
            "posAbb": "LILB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0039412",
            "name": "Javontae Jean-Baptiste",
            "posAbb": "SLB",
            "posRank": 3
          },
          {
            "gsis_id": "00-0040318",
            "name": "Ale Kaho",
            "posAbb": "RILB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB1",
        "gsis_id": "00-0039898",
        "name": "Mike Sainristil",
        "grade": "Above Avg",
        "rating": 81,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039898",
            "name": "Mike Sainristil",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033551",
            "name": "Rasul Douglas",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040731",
            "name": "Trey Amos",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033918",
            "name": "Fabian Moreau",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034780",
            "name": "Isaac Yiadom",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "CB2",
        "gsis_id": "00-0033551",
        "name": "Rasul Douglas",
        "grade": "Below Avg",
        "rating": 67,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0039898",
            "name": "Mike Sainristil",
            "posAbb": "RCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0033551",
            "name": "Rasul Douglas",
            "posAbb": "LCB",
            "posRank": 1
          },
          {
            "gsis_id": "00-0040731",
            "name": "Trey Amos",
            "posAbb": "LCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0033918",
            "name": "Fabian Moreau",
            "posAbb": "RCB",
            "posRank": 2
          },
          {
            "gsis_id": "00-0034780",
            "name": "Isaac Yiadom",
            "posAbb": "RCB",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SCB",
        "gsis_id": "00-0036375",
        "name": "Amik Robertson",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0036375",
            "name": "Amik Robertson",
            "posAbb": "NB",
            "posRank": 1
          }
        ]
      },
      {
        "pos": "FS",
        "gsis_id": "00-0034465",
        "name": "Jeremy Reaves",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0034465",
            "name": "Jeremy Reaves",
            "posAbb": "FS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039149",
            "name": "Quan Martin",
            "posAbb": "FS",
            "posRank": 2
          },
          {
            "gsis_id": "00-0038100",
            "name": "Percy Butler",
            "posAbb": "FS",
            "posRank": 3
          }
        ]
      },
      {
        "pos": "SS",
        "gsis_id": "00-0037616",
        "name": "Nick Cross",
        "grade": "Above Avg",
        "rating": 82,
        "rating_source": "snap_share_v1",
        "candidates": [
          {
            "gsis_id": "00-0037616",
            "name": "Nick Cross",
            "posAbb": "SS",
            "posRank": 1
          },
          {
            "gsis_id": "00-0039681",
            "name": "Tyler Owens",
            "posAbb": "SS",
            "posRank": 2
          }
        ]
      }
    ]
  }
};

export const ROSTERS_META = {
  "generated": "2026-09-20T15:13:22.091Z",
  "availability_stamp": "2026-09-20T09:14:16.763Z",
  "reconciled_by": "fetch-nflverse-roster-base.js",
  "sources": [
    "depth_charts_2026.csv",
    "snap_counts_2026.csv",
    "roster_2026.csv",
    "availability_2026.json"
  ]
};
