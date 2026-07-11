import {
  createEmojiPickerCustomSection,
  type EmojiPickerItem,
  type EmojiPickerUsageEntry,
} from "@slithy/frimousse";

function createUsageEntry(
  item: EmojiPickerItem,
  score: number,
  uses: number,
  lastUsedAt: number,
): EmojiPickerUsageEntry {
  return {
    key: `${item.kind}:${item.id}`,
    item,
    score,
    uses,
    lastUsedAt,
  };
}

export function createDemoInitialFrequentEntries(
  now = Date.now(),
): EmojiPickerUsageEntry[] {
  return [
    createUsageEntry(
      {
        kind: "native",
        id: "👍",
        emoji: "👍",
        label: "Thumbs up",
      },
      5,
      5,
      now,
    ),
    createUsageEntry(
      {
        kind: "native",
        id: "👀",
        emoji: "👀",
        label: "Eyes",
      },
      4,
      4,
      now,
    ),
    createUsageEntry(
      {
        kind: "native",
        id: "🤣",
        emoji: "🤣",
        label: "Rolling on the floor laughing",
      },
      3,
      3,
      now,
    ),
    createUsageEntry(
      {
        kind: "native",
        id: "😅",
        emoji: "😅",
        label: "Grinning face with sweat",
      },
      2,
      2,
      now,
    ),
  ];
}

export const demoCustomSection = createEmojiPickerCustomSection(
  [
    { id: "angry", label: "Angry", imageUrl: "/emoji/angry.gif" },
    { id: "attitude", label: "Attitude", imageUrl: "/emoji/attitude.gif" },
    { id: "blow-up", label: "Blow up", imageUrl: "/emoji/blow_up.gif" },
    { id: "bullhorn", label: "Bullhorn", imageUrl: "/emoji/bullhorn.gif" },
    {
      id: "chest-thump",
      label: "Chest thump",
      imageUrl: "/emoji/chest_thump.gif",
    },
    { id: "cough", label: "Cough", imageUrl: "/emoji/cough.gif" },
    { id: "entranced", label: "Entranced", imageUrl: "/emoji/entranced.gif" },
    { id: "excited", label: "Excited", imageUrl: "/emoji/excited.gif" },
    { id: "eyebrows", label: "Eyebrows", imageUrl: "/emoji/eyebrows.gif" },
    { id: "good-job", label: "Good job", imageUrl: "/emoji/good_job.gif" },
    { id: "haha", label: "Haha", imageUrl: "/emoji/haha.gif" },
    { id: "headbutt", label: "Headbutt", imageUrl: "/emoji/headbutt.gif" },
    { id: "hiding", label: "Hiding", imageUrl: "/emoji/hiding.gif" },
    {
      id: "holding-bomb",
      label: "Holding bomb",
      imageUrl: "/emoji/holding_bomb.gif",
    },
    { id: "in-love", label: "In love", imageUrl: "/emoji/in_love.gif" },
    { id: "injured", label: "Injured", imageUrl: "/emoji/injured.gif" },
    { id: "looking", label: "Looking", imageUrl: "/emoji/looking.gif" },
    { id: "lookout", label: "Lookout", imageUrl: "/emoji/lookout.gif" },
    { id: "love", label: "Love", imageUrl: "/emoji/love.gif" },
    {
      id: "money-bath",
      label: "Money bath",
      imageUrl: "/emoji/money_bath.gif",
    },
    { id: "nudge", label: "Nudge", imageUrl: "/emoji/nudge.gif" },
    { id: "pointing", label: "Pointing", imageUrl: "/emoji/pointing.gif" },
    { id: "puking", label: "Puking", imageUrl: "/emoji/puking.gif" },
    { id: "quivering", label: "Quivering", imageUrl: "/emoji/quivering.gif" },
    { id: "reading", label: "Reading", imageUrl: "/emoji/reading.gif" },
    {
      id: "say-nothing",
      label: "Say nothing",
      imageUrl: "/emoji/say_nothing.gif",
    },
    { id: "scared", label: "Scared", imageUrl: "/emoji/scared.gif" },
    { id: "scheming", label: "Scheming", imageUrl: "/emoji/scheming.gif" },
    {
      id: "see-money",
      label: "See money",
      imageUrl: "/emoji/see_money.gif",
    },
    { id: "surrender", label: "Surrender", imageUrl: "/emoji/surrender.gif" },
    { id: "sweaty", label: "Sweaty", imageUrl: "/emoji/sweaty.gif" },
    { id: "whining", label: "Whining", imageUrl: "/emoji/whining.gif" },
    { id: "whisper", label: "Whisper", imageUrl: "/emoji/whisper.gif" },
    { id: "yelling", label: "Yelling", imageUrl: "/emoji/yelling.gif" },
    { id: "zombie", label: "Zombie", imageUrl: "/emoji/zombie.gif" },
  ],
  {
    id: "custom-emoji",
    label: "Custom emoji",
    position: "append",
  },
);
