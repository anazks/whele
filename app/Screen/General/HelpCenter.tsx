import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Simplified FAQ data
const FAQS = [
  {
    id: '1',
    question: 'What is Wheel Alignment?',
    answer: 'Wheel alignment adjusts a vehicle’s suspension to ensure wheels are correctly positioned for optimal contact with the road.',
  },
  {
    id: '2',
    question: 'Why is proper alignment important?',
    answer: 'It ensures even tire wear, better fuel efficiency, improved handling, and straight tracking on the road.',
  },
  {
    id: '3',
    question: 'How are alignment measurements taken?',
    answer: 'Specialized equipment measures camber, caster, and toe angles of the wheels.',
  },
  {
    id: '4',
    question: 'What do camber, caster, and toe mean?',
    answer: 'Camber is the wheel’s tilt (inward/outward), caster is the steering axis tilt, and toe is the wheel’s inward/outward turn.',
  },
  {
    id: '5',
    question: 'What are signs of misalignment?',
    answer: 'Look for uneven tire wear, vehicle pulling to one side, steering wheel vibration, or off-center steering.',
  },
  {
    id: '6',
    question: 'How often should I check alignment?',
    answer: 'Check every 6,000 miles, after hitting a pothole/curb, or if you notice driving issues.',
  },
  {
    id: '7',
    question: 'How do I interpret measurement values?',
    answer: 'Values are compared to manufacturer specs; green means within tolerance, red means out of spec.',
  },
  {
    id: '8',
    question: 'What measurement units are used?',
    answer: 'Camber and caster use degrees; toe uses degrees or fractions of an inch.',
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle FAQ section
  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter FAQs based on search query
  const filteredFaqs = FAQS.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle email support (placeholder for actual email functionality)
  const handleEmailSupport = () => {
    Linking.openURL('mailto:maharajahublk@gmail.com?subject=Help%20Request')
      .catch(() => Alert.alert('Error', 'Unable to open email app'));
  };

  // Handle live chat (placeholder for actual chat functionality)
  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Live chat support is not yet implemented.');
    // Future implementation: Linking.openURL('https://your-chat-service.com');
  };

  // Render FAQs
  const renderFAQs = () => {
    if (filteredFaqs.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={48} color="#6b7280" />
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      );
    }

    return filteredFaqs.map(faq => (
      <View key={faq.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() => toggleSection(faq.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.questionText}>{faq.question}</Text>
          <Ionicons
            name={expandedSections[faq.id] ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#4b5563"
          />
        </TouchableOpacity>
        {expandedSections[faq.id] && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{faq.answer}</Text>
          </View>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help articles..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* FAQ List */}
      <ScrollView style={styles.faqContainer} showsVerticalScrollIndicator={false}>
        {renderFAQs()}
      </ScrollView>

      {/* Contact Section */}
      <View style={styles.contactContainer}>
        <Text style={styles.contactTitle}>Need More Help?</Text>
        <Text style={styles.contactText}>Contact our support team</Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleEmailSupport}
            activeOpacity={0.7}
          >
            <FontAwesome name="envelope-o" size={16} color="#fff" />
            <Text style={styles.contactButtonText}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactButton, styles.chatButton]}
            onPress={handleLiveChat}
            activeOpacity={0.7}
          >
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
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  faqContainer: {
    flex: 1,
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
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
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  answerText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  contactContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  chatButton: {
    backgroundColor: '#16a34a',
    marginRight: 0,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});