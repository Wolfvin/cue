import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CtaOverlay } from '../../components/CtaOverlay'
import type { DemoCta } from '@cue/core'

describe('CtaOverlay', () => {
  it('renders a button with the correct label for type button', () => {
    const cta: DemoCta = { type: 'button', label: 'Book a Demo' }

    render(<CtaOverlay cta={cta} />)

    const button = screen.getByRole('button', { name: 'Book a Demo' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Book a Demo')
  })

  it('renders input and submit button for type email_capture', () => {
    const cta: DemoCta = {
      type: 'email_capture',
      label: 'Get Notified',
      submitLabel: 'Subscribe',
    }

    render(<CtaOverlay cta={cta} />)

    const input = screen.getByLabelText('Email address')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'email')

    const submitButton = screen.getByRole('button', { name: 'Subscribe' })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('submits email and calls onSubmit with the email value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const cta: DemoCta = {
      type: 'email_capture',
      label: 'Get Notified',
    }

    render(<CtaOverlay cta={cta} onSubmit={onSubmit} />)

    const input = screen.getByLabelText('Email address')
    await user.type(input, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: 'Get started' })
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith('test@example.com')
  })

  it('calls onDismiss when Skip button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const cta: DemoCta = { type: 'button', label: 'Book' }

    render(<CtaOverlay cta={cta} onDismiss={onDismiss} />)

    const skipButton = screen.getByRole('button', { name: 'Skip call to action' })
    await user.click(skipButton)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('shows success state after email submission', async () => {
    const user = userEvent.setup()
    const cta: DemoCta = {
      type: 'email_capture',
      label: 'Get Notified',
      successMessage: 'Thanks for signing up!',
    }

    render(<CtaOverlay cta={cta} />)

    const input = screen.getByLabelText('Email address')
    await user.type(input, 'user@test.com')

    const submitButton = screen.getByRole('button', { name: 'Get started' })
    await user.click(submitButton)

    // After submission, the success message should be visible
    expect(screen.getByText('Thanks for signing up!')).toBeInTheDocument()

    // The form (input and submit) should no longer be present
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument()
  })

  it('renders link variant with correct label and href', () => {
    const cta: DemoCta = {
      type: 'link',
      label: 'Visit Website',
      href: 'https://example.com',
    }

    render(<CtaOverlay cta={cta} />)

    const link = screen.getByRole('link', { name: 'Visit Website' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('does not submit empty email', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const cta: DemoCta = {
      type: 'email_capture',
      label: 'Get Notified',
    }

    render(<CtaOverlay cta={cta} onSubmit={onSubmit} />)

    const submitButton = screen.getByRole('button', { name: 'Get started' })
    await user.click(submitButton)

    // onSubmit should not be called with empty email
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
