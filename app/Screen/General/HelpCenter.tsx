import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const faqData = {
    general: [
      {
        question: "What is Wheel Alignment?",
        answer: "Wheel alignment refers to the adjustment of a vehicle's suspension system to ensure that wheels are positioned correctly relative to each other and the road surface."
      },
      {
        question: "Why is proper alignment important?",
        answer: "Proper alignment ensures even tire wear, improves fuel efficiency, enhances vehicle handling, and maintains straight tracking on level roads."
      }
    ],
    measurements: [
      {
        question: "How are alignment measurements taken?",
        answer: "Alignment measurements are typically taken using specialized equipment that measures camber, caster, and toe angles of your wheels."
      },
      {
        question: "What do camber, caster, and toe mean?",
        answer: "Camber is the inward or outward tilt of the wheel. Caster is the forward or backward tilt of the steering axis. Toe is the extent to which wheels turn inward or outward."
      }
    ],
    issues: [
      {
        question: "What are signs of misalignment?",
        answer: "Common signs include uneven tire wear, vehicle pulling to one side, steering wheel vibration, or the steering wheel being off-center when driving straight."
      },
      {
        question: "How often should I check alignment?",
        answer: "It's recommended to check alignment every 6,000 miles or if you notice any driving issues or after hitting a significant pothole or curb."
      }
    ],
    technical: [
      {
        question: "How do I interpret the measurement values?",
        answer: "Measurement values are compared against manufacturer specifications. Green values typically indicate within tolerance, while red values show out-of-spec measurements."
      },
      {
        question: "What measurement units are used?",
        answer: "Angles are typically measured in degrees for camber and caster, while toe is often measured in degrees or fractions of an inch."
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'list' },
    { id: 'general', name: 'General', icon: 'help' },
    { id: 'measurements', name: 'Measurements', icon: 'speed' },
    { id: 'issues', name: 'Common Issues', icon: 'warning' },
    { id: 'technical', name: 'Technical', icon: 'settings' }
  ];

  const filteredFaqs = () => {
    if (activeCategory === 'all') {
      return Object.values(faqData).flat();
    }
    return faqData[activeCategory] || [];
  };

  const renderFAQs = () => {
    const data = filteredFaqs();
    
    return data.map((item, index) => (
      <View key={index} style={styles.faqItem}>
        <TouchableOpacity 
          style={styles.questionContainer}
          onPress={() => toggleSection(index)}
        >
          <Text style={styles.questionText}>{item.question}</Text>
          <Ionicons 
            name={expandedSections[index] ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
        {expandedSections[index] && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Help Center</Text>
        <Text style={styles.headerSubtitle}>Find answers to common questions</Text> */}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <MaterialIcons 
              name={category.icon} 
              size={18} 
              color={activeCategory === category.id ? '#fff' : '#555'} 
            />
            <Text style={[
              styles.categoryText,
              activeCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.faqContainer}>
        {renderFAQs()}
      </ScrollView>

      <View style={styles.contactContainer}>
        <Text style={styles.contactTitle}>Need more help?</Text>
        <Text style={styles.contactText}>Contact our support team</Text>
        
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <FontAwesome name="envelope-o" size={16} color="#fff" />
            <Text style={styles.contactButtonText}>Email Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.contactButton, styles.chatButton]}>
            <Ionicons name="chatbubbles-outline" size={16} color="#fff" />
            <Text style={styles.contactButtonText}>Live Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  categoryScroll: {
    marginBottom: 16,
    maxHeight: 44,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryButtonActive: {
    backgroundColor: '#495057',
    borderColor: '#495057',
  },
  categoryText: {
    marginLeft: 6,
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#fff',
  },
  faqContainer: {
    flex: 1,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#495057',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  chatButton: {
    backgroundColor: '#0ca678',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 14,
  },
});