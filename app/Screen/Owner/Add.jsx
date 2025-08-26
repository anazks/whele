import { Platform, StyleSheet } from 'react-native';

export const FormStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2c3e50',
    letterSpacing: -0.5,
  },
  formSelection: {
    flexDirection: 'row',
    marginTop: 60,
    marginBottom: 25,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  formOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  activeFormOption: {
    backgroundColor: '#3498db',
  },
  formOptionText: {
    fontSize: 15,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeFormOptionText: {
    color: 'white',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
    }),
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#2c3e50',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
    fontWeight: '500',
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
    ...Platform.select({
      android: {
        textAlignVertical: 'top',
      },
    }),
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fef5f5',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    minHeight: 56,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  selectedText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: '#adb5bd',
    flex: 1,
  },
  selectedBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandImage: {
    width: 28,
    height: 28,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  vehicleList: {
    maxHeight: 180,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  vehicleItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  selectedVehicleItem: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  vehicleText: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
    lineHeight: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
    }),
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  modalSearchIcon: {
    marginRight: 12,
    color: '#6c757d',
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  modalList: {
    maxHeight: 320,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  modalItemDetail: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    lineHeight: 18,
  },
  noVariantsText: {
    textAlign: 'center',
    padding: 24,
    color: '#6c757d',
    fontStyle: 'italic',
    fontSize: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  brandGrid: {
    maxHeight: 420,
  },
  brandGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  brandCard: {
    width: '47%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
  },
  brandCardImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  brandCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  brandCardVariants: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#e74c3c',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // Additional styles for better visual hierarchy
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 16,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 20,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '500',
    lineHeight: 20,
  },
  requiredIndicator: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  // Focus states
  inputFocused: {
    borderColor: '#3498db',
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  selectorPressed: {
    backgroundColor: '#f8f9fa',
    borderColor: '#3498db',
  },
});