import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from '@/components/FormField'

jest.mock('@/store/formStore', () => ({
  useFormStore: jest.fn(),
}))

describe('FormField Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render text input for non-multiline field', () => {
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        preferredName: 'John',
        setField: jest.fn(),
      })
    )

    render(
      <FormField label="Preferred name" field="preferredName" multiline={false} />
    )

    const input = screen.getByDisplayValue('John') as HTMLInputElement
    expect(input.type).toBe('text')
  })

  it('should render textarea for multiline field', () => {
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        backgroundSummary: 'Senior engineer',
        setField: jest.fn(),
      })
    )

    render(
      <FormField
        label="Background summary"
        field="backgroundSummary"
        multiline={true}
      />
    )

    const textarea = screen.getByDisplayValue('Senior engineer') as HTMLTextAreaElement
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea.rows).toBe(4)
  })

  it('should display label text', () => {
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        preferredName: '',
        setField: jest.fn(),
      })
    )

    render(
      <FormField label="Test Label" field="preferredName" multiline={false} />
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should call setField when input value changes', async () => {
    const mockSetField = jest.fn()
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        preferredName: '',
        setField: mockSetField,
      })
    )

    render(
      <FormField label="Preferred name" field="preferredName" multiline={false} />
    )

    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'Jane')

    expect(mockSetField).toHaveBeenLastCalledWith('preferredName', 'Jane')
  })

  it('should call setField when textarea value changes', async () => {
    const mockSetField = jest.fn()
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        backgroundSummary: '',
        setField: mockSetField,
      })
    )

    render(
      <FormField
        label="Background"
        field="backgroundSummary"
        multiline={true}
      />
    )

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test background' } })

    expect(mockSetField).toHaveBeenCalledWith(
      'backgroundSummary',
      'Test background'
    )
  })

  it('should display current field value', () => {
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        preferredName: 'Alice',
        setField: jest.fn(),
      })
    )

    render(
      <FormField label="Preferred name" field="preferredName" multiline={false} />
    )

    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
  })

  it('should handle empty field values', () => {
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        preferredName: '',
        setField: jest.fn(),
      })
    )

    render(
      <FormField label="Preferred name" field="preferredName" multiline={false} />
    )

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('should render all form field types', () => {
    const mockSetField = jest.fn()
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        [selector.field]: 'value',
        setField: mockSetField,
      })
    )

    const fields = [
      { label: 'Name', field: 'preferredName', multiline: false },
      { label: 'Background', field: 'backgroundSummary', multiline: true },
      { label: 'Environment', field: 'workEnvironment', multiline: false },
      { label: 'Industry', field: 'industryPreference', multiline: false },
    ]

    fields.forEach((fieldProps) => {
      const { unmount } = render(
        <FormField {...fieldProps} />
      )
      expect(screen.getByText(fieldProps.label)).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle multiline default value correctly', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4'
    const { useFormStore } = require('@/store/formStore')
    useFormStore.mockImplementation((selector: any) =>
      selector({
        dealbreakers: multilineText,
        setField: jest.fn(),
      })
    )

    render(
      <FormField label="Dealbreakers" field="dealbreakers" multiline={true} />
    )

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe(multilineText)
  })
})
