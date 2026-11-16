import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '../components/ScreenHeader';
import Field from '../components/Field';
import Button from '../components/Button';
import { contactApi } from '../services/api';
import { colors } from '../theme';

export default function ContactScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      Alert.alert(t('common.error'), t('contact.missingFields'));
      return;
    }

    setLoading(true);
    try {
      await contactApi.sendMessage({ name, email, phone, subject, message });
      Alert.alert(t('common.success'), t('contact.sent'));
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (error) {
      Alert.alert(t('common.error'), t('contact.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScreenHeader title={t('nav.contactTitle')} subtitle={t('contact.subtitle')} />
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <Field label={t('contact.fullName')} icon="person-outline" placeholder={t('contact.fullNamePlaceholder')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
        <Field
          label={t('contact.email')}
          icon="mail-outline"
          placeholder={t('contact.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field label={t('contact.phone')} icon="call-outline" placeholder={t('contact.phonePlaceholder')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
        <Field label={t('contact.subject')} icon="pricetag-outline" placeholder={t('contact.subjectPlaceholder')} value={subject} onChangeText={setSubject} />
        <Field
          label={t('contact.message')}
          icon="chatbubble-outline"
          placeholder={t('contact.messagePlaceholder')}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
        />
        <Button title={loading ? t('contact.submitting') : t('contact.submit')} icon="send" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  form: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
});
