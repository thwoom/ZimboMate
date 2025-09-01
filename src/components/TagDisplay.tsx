import React, { useState } from 'react';
import { Tag, ItemTag } from '../models/Equipment';
import './TagDisplay.css';

interface TagDisplayProps {
  tags: Tag[];
  showTooltips?: boolean;
  showUses?: boolean;
  onUseDecrement?: (tagName: string) => void;
  className?: string;
}

// Tag descriptions for tooltips
const TAG_DESCRIPTIONS: Record < ItemTag, string> = {
  // Weapon range tags
  'hand': 'Useful for attacking within reach',
  'close': 'Useful at arm\'s reach plus a foot or two',
  'reach': 'Useful for attacking several feet away (up to ~10 feet)',
  'near': 'Useful if you can see the whites of their eyes',
  'far': 'Useful for attacking something in shouting distance',

  // Weapon mechanical effect tags
  'forceful': 'Can knock someone back, maybe off their feet',
  'messy': 'Destructive damage, ripping things apart',
  'precise': 'Use DEX to hack and slash instead of STR',
  'reload': 'Takes more than a moment to reset after attack',
  'stun': 'Does stun damage instead of normal damage',
  'thrown': 'Can be thrown; gone until recovered if used with Volley',
  'two-handed': 'Takes two hands to use effectively',
  'ignores-armor': 'Don\'t subtract armor from damage taken',

  // Armor tags
  'worn': 'Must be wearing it to use',
  'clumsy': '-1 ongoing while using (cumulative penalty)',

  // General equipment tags
  'applied': 'Only useful when carefully applied to person or consumable',
  'awkward': 'Unwieldy and tough to use',
  'dangerous': 'Easy to get in trouble with; GM may invoke consequences',
  'ration': 'Edible, more or less',
  'requires': 'Only useful to certain people who meet requirements',
  'slow': 'Takes minutes or more to use',
  'touch': 'Used by touching to target\'s skin',

  // Numeric tags
  'piercing': 'Subtract value from enemy\'s armor for attack',
  'ammo': 'Counts as ammunition for ranged weapons',
  'damage': 'Add value to damage dealt',
  'armor': 'Protects from harm (highest value only)',
  'armor-plus': 'Stacks with other armor',
  'bonus': 'Modifies effectiveness in specified situations',
  'uses': 'Can only be used this many times',
  'weight': 'Counts against Load',
  'coins': 'Cost to buy',

  // Extended tags
  'chaotic': 'Aligned with chaos',
  'evil': 'Aligned with evil',
  'good': 'Aligned with good',
  'lawful': 'Aligned with law',
  'magical': 'Has magical properties',
  'holy': 'Blessed or divine',
  'unholy': 'Cursed or profane',
};

// Tag categories for styling
const TAG_CATEGORIES = {
  range: ['hand', 'close', 'reach', 'near', 'far'],
  weapon: ['forceful', 'messy', 'precise', 'reload', 'stun', 'thrown', 'two-handed', 'ignores-armor'],
  armor: ['worn', 'clumsy'],
  general: ['applied', 'awkward', 'dangerous', 'ration', 'requires', 'slow', 'touch'],
  numeric: ['piercing', 'ammo', 'damage', 'armor', 'armor-plus', 'bonus', 'uses', 'weight', 'coins'],
  alignment: ['chaotic', 'evil', 'good', 'lawful'],
  magical: ['magical', 'holy', 'unholy'],
};

export const TagDisplay: React.FC < TagDisplayProps> = ({
  tags,
  showTooltips = true,
  showUses = true,
  onUseDecrement,
  className = '',
}) => {
  const [hoveredTag, setHoveredTag] = useState < string | null>(null);

  const getTagCategory = (tagName: string): string => {
    for (const [category, tagList] of Object.entries(TAG_CATEGORIES)) {
      if (tagList.includes(tagName as ItemTag)) {
        return category;
      }
    }
    return 'custom';
  };

  const getTagDescription = (tag: Tag): string => {
    if (tag.name in TAG_DESCRIPTIONS) {
      const baseDesc = TAG_DESCRIPTIONS[tag.name as ItemTag];
      if (tag.value !== undefined) {
        return `${baseDesc} (${tag.value})`;
      }
      return baseDesc;
    }
    return tag.value ? `${tag.name} ${tag.value}` : tag.name;
  };

  const handleUseClick = (tag: Tag) => {
    if (tag.name === 'uses' && tag.value && typeof tag.value === 'number' && tag.value > 0 && onUseDecrement) {
      onUseDecrement(tag.name);
    }
  };

  const canDecrementUses = (tag: Tag): boolean => {
    return tag.name === 'uses' &&
           tag.value !== undefined &&
           typeof tag.value === 'number' &&
           tag.value > 0 &&
           onUseDecrement !== undefined;
  };

  return (
    <div className={`tag-display ${className}`}>
      {tags.map((tag, index) => {
        const category = getTagCategory(tag.name);
        const description = getTagDescription(tag);
        const isClickable = canDecrementUses(tag);

        return (
          <div
            key={`${tag.name}-${index}`}
            className={`tag tag-${category} ${isClickable ? 'tag-clickable' : ''}`}
            onMouseEnter={() => showTooltips && setHoveredTag(tag.name)}
            onMouseLeave={() => setHoveredTag(null)}
            onClick={() => handleUseClick(tag)}
            title={showTooltips ? description : undefined}
          >
            <span className="tag-name">{tag.name}</span>
            {tag.value !== undefined && (
              <span className="tag-value">{tag.value}</span>
            )}
            {showTooltips && hoveredTag === tag.name && (
              <div className="tag-tooltip">
                {description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TagDisplay;
