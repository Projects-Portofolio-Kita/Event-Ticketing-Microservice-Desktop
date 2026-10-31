/**
 * @file EventCardImage.tsx
 * @description Event card thumbnail image and floating status badge.
 */
import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { EventCardImageProps } from './event_card_types';

export const EventCardImage: React.FC<EventCardImageProps> = ({ image, title, status }) => (
  <div className="relative h-[200px] bg-subtle overflow-hidden">
    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    {status && (
      <div className="absolute top-2.5 right-2.5">
        <StatusBadge label={status} />
      </div>
    )}
  </div>
);
