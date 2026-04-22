/**
 * npcDialogueData.js — Central dialogue table for Syntax Province.
 *
 * Each NPC has dialogue branching based on the player's current story state.
 * States:
 *   - first_meet (when quest is first given)
 *   - quest_active (quest given but not complete)
 *   - quest_complete (turn in the quest / unlock gate)
 *   - already_completed (post-completion text)
 *   - locked (prerequisites not met)
 */

export const NPC_DIALOGUE = {
  pappa_heroka: {
    locked: {
      text: "Zzz... Oh, sorry! Let me wake up first.",
      autoInteract: false
    },
    first_meet: {
      text: "Ah, the new Hero! Welcome to Flameroar Academy. Use your arrow keys or WASD to move around. Go speak to the Queen once you've got your legs working.",
      autoInteract: true
    },
    already_completed: {
      text: "You move with the grace of a true Knight! The Queen is waiting for you in the courtyard.",
      autoInteract: false
    }
  },
  Queen: {
    locked: {
      text: "You must learn to walk before you can run. See Pappa Heroka first.",
      autoInteract: false
    },
    first_meet: {
      text: "Welcome, brave one. Syntax Province is overrun by wild Bugs and corrupted Operators. I grant you the Code-Dex. Your first task: defeat the Thief in the North-East and bring back the Identity Medal.",
      autoInteract: true
    },
    quest_active: {
      text: "The Thief still roams the Outlaw Trail. Defeat them and return once you have the Identity Medal.",
      autoInteract: false
    },
    already_completed: {
      text: "You've proven your worth. Continue your journey through Syntax Province. The Mountain King awaits you next.",
      autoInteract: false
    }
  },
  Thief: {
    locked: {
      text: "Heh, I only battle heroes who officially accepted the Queen's bounty. Scram!",
      autoInteract: false
    },
    first_meet: {
      text: "You think you can take me? I've stolen more variables than you've instantiated! Let's see what you've got!",
      autoInteract: false
    },
    already_completed: {
      text: "(Groans) You and your well-typed data... You won, fair and square. The Identity Medal is yours.",
      autoInteract: false
    }
  },
  Mountainking: {
    locked: {
      text: "A weakling approaches my mountain! Return when you hold the Identity Medal.",
      autoInteract: false
    },
    first_meet: {
      text: "I am the Mountain King, master of Logic and Operators! If you want to pass, you must survive my Boolean barrage!",
      autoInteract: false
    },
    already_completed: {
      text: "Ha ha ha! A battle well fought. The Logic Medal suits you. The Archer in the ridge won't be so forgiving, however.",
      autoInteract: false
    }
  },
  Archer: {
    locked: {
      text: "Halt. Without the Logic Medal, your conditional aim will wander. Obtain it first.",
      autoInteract: false
    },
    first_meet: {
      text: "Precision is key. If you step forward, else you step back. Can you navigate the branching paths of my arrows? Let us begin!",
      autoInteract: false
    },
    already_completed: {
      text: "A true marksman of code! The Decision Medal is yours. Beware the Bishop in the Cathedral—his loops run eternal.",
      autoInteract: false
    }
  },
  Bishop: {
    locked: {
      text: "The bells toll only for those hold the Decision Medal. Begone.",
      autoInteract: false
    },
    first_meet: {
      text: "Welcome to the Cathedral of Cycles. We pray in while-loops and repent in for-loops. Let me test if your mind can handle the repetition without crashing!",
      autoInteract: false
    },
    already_completed: {
      text: "Your exit condition was flawless. Take the Cycle Medal, and seek the King at the Royal Gate.",
      autoInteract: false
    }
  },
  King: {
    locked: {
      text: "The Royal Gate remains shut. Only a hero with all 4 Medals of Syntax may speak with me.",
      autoInteract: false
    },
    first_meet: {
      text: "Magnificent! You carry the Medals of Identity, Logic, Decision, and Cycle. I grant you the Castle Key. The Princess awaits you in the Final Arena.",
      autoInteract: false
    },
    already_completed: {
      text: "The Final Arena is open to you. May the Compilers have mercy on your soul.",
      autoInteract: false
    }
  },
  Princess: {
    locked: {
      text: "I cannot assist you without the Castle Key from my father, the King.",
      autoInteract: false
    },
    first_meet: {
      text: "You made it! But wait... a corrupted Mage has taken over the arena! You must defeat him to restore peace to Syntax Province!",
      autoInteract: false
    },
    already_completed: {
      text: "Thank you for saving us! Your journey here is complete, but many more bugs await in the realm beyond.",
      autoInteract: false
    }
  },
  Mage: {
    locked: {
      text: "FOOL! You dare approach me without the Princess's blessing?",
      autoInteract: false
    },
    first_meet: {
      text: "I AM THE MAGE OF RUNTIME TERRORS! YOUR SYNTAX IS WEAK! PREPARE FOR AN INFINITE LOOP OF PAIN!",
      autoInteract: false // Triggers the boss battle
    },
    already_completed: {
      text: "(Coughing) Ah... my memory leaks... are finally... garbage collected...",
      autoInteract: false
    }
  }
};

/**
 * Determine the correct dialogue state for an NPC based on user progress.
 */
export function getNpcDialogue(npcId, progressTokens, completedInteractions = []) {
  const npcData = NPC_DIALOGUE[npcId];
  if (!npcData) {
    return { text: "...", autoInteract: false };
  }

  // Check if they've already completed this NPC's main quest/battle
  if (completedInteractions.includes(npcId)) {
    if (npcId === 'Queen') {
      if (progressTokens.has('castle_key')) return { text: "You have obtained the Castle Key! Go to the Final Arena and free the Princess.", autoInteract: false };
      if (progressTokens.has('medal_cycle')) return { text: "Excellent! You have the Cycle Medal. Proceed to the Royal Gate and speak with the King.", autoInteract: false };
      if (progressTokens.has('medal_decision')) return { text: "The Bishop awaits in the Cathedral of Cycles. Don't lose yourself in his loops!", autoInteract: false };
      if (progressTokens.has('medal_logic')) return { text: "The Archer on the ridge is your next challenge. His conditional aim is deadly.", autoInteract: false };
      return npcData.already_completed;
    }
    return npcData.already_completed || npcData.first_meet || { text: "...", autoInteract: false };
  }

  // Determine lock conditions
  switch (npcId) {
    case 'Queen':
      if (!progressTokens.has('tutorial_completed')) return npcData.locked;
      if (progressTokens.has('codedex_unlocked')) return npcData.quest_active;
      break;
    case 'Thief':
      if (!progressTokens.has('codedex_unlocked')) return npcData.locked;
      break;
    case 'Mountainking':
      if (!progressTokens.has('medal_identity')) return npcData.locked;
      break;
    case 'Archer':
      if (!progressTokens.has('medal_logic')) return npcData.locked;
      break;
    case 'Bishop':
      if (!progressTokens.has('medal_decision')) return npcData.locked;
      break;
    case 'King':
      if (!progressTokens.has('medal_cycle')) return npcData.locked;
      break;
    case 'Princess':
      if (!progressTokens.has('castle_key')) return npcData.locked;
      break;
    case 'Mage':
      if (!progressTokens.has('castle_key')) return npcData.locked; // simplified, just gate behind key
      break;
    default:
      break;
  }

  // If not locked, not completed, and not quest_active, it's first_meet
  return npcData.first_meet || { text: "...", autoInteract: false };
}
