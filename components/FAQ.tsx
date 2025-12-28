'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import styles from './FAQ.module.css';
import clsx from 'clsx';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className={styles.faqItem}>
            <button
              className={clsx(styles.faqButton, isOpen && styles.faqButtonOpen)}
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
            >
              <span className={styles.faqQuestion}>{item.question}</span>
              <span className={styles.faqIcon}>
                {isOpen ? <Minus size={20} /> : <Plus size={20} />}
              </span>
            </button>
            <div
              className={clsx(styles.faqAnswer, isOpen && styles.faqAnswerOpen)}
            >
              <div className={styles.faqAnswerContent}>{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

