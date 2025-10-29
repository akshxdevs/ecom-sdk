/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ecom_dapp.json`.
 */
export type EcomDapp = {
  "address": "FYo4gi69vTJZJMnNxj2mZz2Q9CbUu12rQDVtHNUFQ2o7",
  "metadata": {
    "name": "ecomDapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addToCart",
      "discriminator": [
        26,
        59,
        128,
        236,
        247,
        119,
        16,
        238
      ],
      "accounts": [
        {
          "name": "consumer",
          "writable": true,
          "signer": true
        },
        {
          "name": "cart",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "consumer"
              },
              {
                "kind": "arg",
                "path": "productName"
              }
            ]
          }
        },
        {
          "name": "products",
          "writable": true
        },
        {
          "name": "cartList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114,
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "consumer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "productName",
          "type": "string"
        },
        {
          "name": "quantity",
          "type": "u32"
        },
        {
          "name": "sellerPubkey",
          "type": "pubkey"
        },
        {
          "name": "productImgurl",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u32"
        }
      ]
    },
    {
      "name": "createEscrow",
      "discriminator": [
        253,
        215,
        165,
        116,
        36,
        108,
        68,
        80
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "payment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "escrowAta",
          "writable": true
        },
        {
          "name": "buyerAta",
          "writable": true
        },
        {
          "name": "sellerAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "buyerPubkey",
          "type": "pubkey"
        },
        {
          "name": "sellerPubkey",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createOrder",
      "discriminator": [
        141,
        54,
        37,
        207,
        237,
        210,
        250,
        215
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "order",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "paymentId",
          "type": "string"
        }
      ]
    },
    {
      "name": "createPayment",
      "discriminator": [
        28,
        81,
        85,
        253,
        7,
        223,
        154,
        42
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "payments",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "paymentAmount",
          "type": "u64"
        },
        {
          "name": "productPubkey",
          "type": "pubkey"
        },
        {
          "name": "txSignature",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "createProduct",
      "discriminator": [
        183,
        155,
        202,
        119,
        43,
        114,
        174,
        225
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "product",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "arg",
                "path": "productName"
              }
            ]
          }
        },
        {
          "name": "productList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "seller"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "productName",
          "type": "string"
        },
        {
          "name": "productShortDescription",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u32"
        },
        {
          "name": "category",
          "type": {
            "defined": {
              "name": "category"
            }
          }
        },
        {
          "name": "division",
          "type": {
            "defined": {
              "name": "division"
            }
          }
        },
        {
          "name": "sellerName",
          "type": "string"
        },
        {
          "name": "productImgurl",
          "type": "string"
        }
      ]
    },
    {
      "name": "depositEscrow",
      "discriminator": [
        226,
        112,
        158,
        176,
        178,
        118,
        153,
        128
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "payment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "escrowAta",
          "writable": true
        },
        {
          "name": "buyerAta",
          "writable": true
        },
        {
          "name": "sellerAta",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "withdrawEscrow",
      "discriminator": [
        81,
        84,
        226,
        128,
        245,
        47,
        96,
        104
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "payment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "escrowAta",
          "writable": true
        },
        {
          "name": "buyerAta",
          "writable": true
        },
        {
          "name": "sellerAta",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "productId",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "cart",
      "discriminator": [
        110,
        9,
        100,
        44,
        36,
        143,
        131,
        88
      ]
    },
    {
      "name": "cartList",
      "discriminator": [
        25,
        206,
        228,
        30,
        190,
        207,
        217,
        135
      ]
    },
    {
      "name": "escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    },
    {
      "name": "order",
      "discriminator": [
        134,
        173,
        223,
        185,
        77,
        86,
        28,
        51
      ]
    },
    {
      "name": "payment",
      "discriminator": [
        227,
        231,
        51,
        26,
        244,
        88,
        4,
        148
      ]
    },
    {
      "name": "product",
      "discriminator": [
        102,
        76,
        55,
        251,
        38,
        73,
        224,
        229
      ]
    },
    {
      "name": "productsList",
      "discriminator": [
        149,
        195,
        105,
        191,
        84,
        99,
        84,
        70
      ]
    }
  ],
  "events": [
    {
      "name": "cartCreated",
      "discriminator": [
        125,
        96,
        231,
        239,
        17,
        235,
        104,
        84
      ]
    },
    {
      "name": "productCreated",
      "discriminator": [
        41,
        64,
        29,
        113,
        18,
        124,
        58,
        82
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidPayment",
      "msg": "Invalid Payment: Payment details are invalid.."
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "InsufficientFunds: Not enough funds to complete the transaction."
    },
    {
      "code": 6002,
      "name": "accountNotInitialized",
      "msg": "AccountNotInitialized: The account has not been initialized."
    },
    {
      "code": 6003,
      "name": "accountAlreadyInitialized",
      "msg": "AccountAlreadyInitialized: The account is already initialized."
    },
    {
      "code": 6004,
      "name": "fundsNotFound",
      "msg": "FundsNotFound: The specified DAO does not exist."
    },
    {
      "code": 6005,
      "name": "escrowError",
      "msg": "Invalid Payment: Payment details are invalid.."
    },
    {
      "code": 6006,
      "name": "daoNotActive",
      "msg": "DAONotActive: The DAO is not active and cannot accept proposals or votes."
    },
    {
      "code": 6007,
      "name": "proposalNotFound",
      "msg": "ProposalNotFound: The specified proposal does not exist."
    },
    {
      "code": 6008,
      "name": "proposalNotActive",
      "msg": "ProposalNotActive: The proposal is not active and cannot be voted on."
    },
    {
      "code": 6009,
      "name": "proposalAlreadyExecuted",
      "msg": "ProposalAlreadyExecuted: The proposal has already been executed."
    },
    {
      "code": 6010,
      "name": "proposalExpired",
      "msg": "ProposalExpired: The proposal has expired and can no longer be voted on."
    },
    {
      "code": 6011,
      "name": "proposalVotingThresholdNotMet",
      "msg": "ProposalVotingThresholdNotMet: The proposal did not meet the required voting threshold."
    },
    {
      "code": 6012,
      "name": "proposalAlreadyCanceled",
      "msg": "ProposalAlreadyCanceled: The proposal has already been canceled."
    },
    {
      "code": 6013,
      "name": "proposalNotCancelable",
      "msg": "ProposalNotCancelable: The proposal cannot be canceled in its current state."
    },
    {
      "code": 6014,
      "name": "memberNotFound",
      "msg": "MemberNotFound: The specified member does not exist in the DAO."
    },
    {
      "code": 6015,
      "name": "memberAlreadyExists",
      "msg": "MemberAlreadyExists: The user is already a member of the DAO."
    },
    {
      "code": 6016,
      "name": "insufficientStake",
      "msg": "InsufficientStake: The user has not staked enough tokens to perform this action."
    },
    {
      "code": 6017,
      "name": "stakeLocked",
      "msg": "StakeLocked: The staked tokens are locked and cannot be withdrawn yet."
    },
    {
      "code": 6018,
      "name": "treasuryWithdrawalFailed",
      "msg": "TreasuryWithdrawalFailed: The treasury withdrawal failed due to insufficient funds or invalid parameters."
    },
    {
      "code": 6019,
      "name": "treasuryDepositFailed",
      "msg": "TreasuryDepositFailed: The treasury deposit failed due to invalid parameters."
    },
    {
      "code": 6020,
      "name": "alreadyVoted",
      "msg": "AlreadyVoted: The user has already voted on this proposal."
    },
    {
      "code": 6021,
      "name": "votingNotAllowed",
      "msg": "VotingNotAllowed: The user is not allowed to vote on this proposal."
    },
    {
      "code": 6022,
      "name": "memberNotActive",
      "msg": "MemberNotActive: The user is not active."
    },
    {
      "code": 6023,
      "name": "cannotDelegateToSelf",
      "msg": "Cannot delegate vote to self."
    },
    {
      "code": 6024,
      "name": "alreadyDelegated",
      "msg": "Vote has already been delegated."
    },
    {
      "code": 6025,
      "name": "invalidOrganization",
      "msg": "Member does not belong to this organization."
    }
  ],
  "types": [
    {
      "name": "cart",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "productId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "productName",
            "type": "string"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "sellerPubkey",
            "type": "pubkey"
          },
          {
            "name": "productImgurl",
            "type": "string"
          },
          {
            "name": "stockStatus",
            "type": {
              "defined": {
                "name": "anchor::states::cart::Stock"
              }
            }
          },
          {
            "name": "amount",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "cartBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "cartCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "productName",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "cartList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cartList",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "cartListBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "category",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "electronics"
          },
          {
            "name": "beautyAndPersonalCare"
          },
          {
            "name": "snacksAndDrinks"
          },
          {
            "name": "householdEssentials"
          },
          {
            "name": "groceryAndKitchen"
          }
        ]
      }
    },
    {
      "name": "division",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "mobile"
          },
          {
            "name": "laptop"
          },
          {
            "name": "headphone"
          },
          {
            "name": "smartWatch"
          },
          {
            "name": "computerPeripherals"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "buyerPubkey",
            "type": "pubkey"
          },
          {
            "name": "sellerPubkey",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "releaseFund",
            "type": "bool"
          },
          {
            "name": "timeStamp",
            "type": "i64"
          },
          {
            "name": "updateTimestamp",
            "type": "i64"
          },
          {
            "name": "escrowStatus",
            "type": {
              "defined": {
                "name": "escrowStatus"
              }
            }
          },
          {
            "name": "escrowBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "escrowStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "swapPending"
          },
          {
            "name": "fundsReceived"
          },
          {
            "name": "swapSuccess"
          },
          {
            "name": "transferFailed"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "orderId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "paymentId",
            "type": "string"
          },
          {
            "name": "trackingId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "orderStatus",
            "type": {
              "defined": {
                "name": "orderStatus"
              }
            }
          },
          {
            "name": "orderTracking",
            "type": {
              "defined": {
                "name": "orderTracking"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "orderBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "orderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "placed"
          },
          {
            "name": "failed"
          },
          {
            "name": "returned"
          }
        ]
      }
    },
    {
      "name": "orderTracking",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "watingForOrders"
          },
          {
            "name": "booked"
          },
          {
            "name": "inTransit"
          },
          {
            "name": "shipped"
          },
          {
            "name": "outForDelivery"
          },
          {
            "name": "delivered"
          }
        ]
      }
    },
    {
      "name": "payment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paymentId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "productPubkey",
            "type": "pubkey"
          },
          {
            "name": "paymentMethod",
            "type": {
              "defined": {
                "name": "paymentMethod"
              }
            }
          },
          {
            "name": "paymentStatus",
            "type": {
              "defined": {
                "name": "paymentStatus"
              }
            }
          },
          {
            "name": "timeStamp",
            "type": "i64"
          },
          {
            "name": "txSignature",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "paymentBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "paymentMethod",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "sol"
          },
          {
            "name": "eth"
          },
          {
            "name": "btc"
          },
          {
            "name": "usdt"
          },
          {
            "name": "usdc"
          }
        ]
      }
    },
    {
      "name": "paymentStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "success"
          },
          {
            "name": "pending"
          },
          {
            "name": "failed"
          }
        ]
      }
    },
    {
      "name": "product",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "productId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "productName",
            "type": "string"
          },
          {
            "name": "category",
            "type": {
              "defined": {
                "name": "category"
              }
            }
          },
          {
            "name": "division",
            "type": {
              "defined": {
                "name": "division"
              }
            }
          },
          {
            "name": "quantity",
            "type": "u32"
          },
          {
            "name": "sellerPubkey",
            "type": "pubkey"
          },
          {
            "name": "sellerName",
            "type": "string"
          },
          {
            "name": "productShortDescription",
            "type": "string"
          },
          {
            "name": "productImgurl",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u32"
          },
          {
            "name": "rating",
            "type": "f32"
          },
          {
            "name": "stockStatus",
            "type": {
              "defined": {
                "name": "anchor::states::product::Stock"
              }
            }
          },
          {
            "name": "creationBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "productCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "productPubkey",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "productName",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u32"
          },
          {
            "name": "category",
            "type": {
              "defined": {
                "name": "category"
              }
            }
          },
          {
            "name": "division",
            "type": {
              "defined": {
                "name": "division"
              }
            }
          }
        ]
      }
    },
    {
      "name": "productsList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "products",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "productListBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "anchor::states::cart::Stock",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "outOfStock"
          },
          {
            "name": "inStock"
          },
          {
            "name": "restoring"
          }
        ]
      }
    },
    {
      "name": "anchor::states::product::Stock",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "outOfStock"
          },
          {
            "name": "inStock"
          },
          {
            "name": "restoring"
          }
        ]
      }
    }
  ]
};
