import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../page'

describe('Version Modal Integration', () => {
  it('должен отображать кнопку Version в футере при загрузке страницы', () => {
    render(<Home />)

    const versionButton = screen.getByText(/version/i)
    expect(versionButton).toBeInTheDocument()
    expect(versionButton).toBeVisible()
  })

  it('должен открывать modal при клике на кнопку Version', async () => {
    render(<Home />)

    const versionButton = screen.getByText(/version/i)
    fireEvent.click(versionButton)

    await waitFor(() => {
      const modalTitle = screen.getByText('Version Information')
      expect(modalTitle).toBeInTheDocument()
    })
  })

  it('должен отображать корректные версии в modal', async () => {
    render(<Home />)

    const versionButton = screen.getByText(/version/i)
    fireEvent.click(versionButton)

    await waitFor(() => {
      expect(screen.getByText('v0.1.0')).toBeInTheDocument()
      expect(screen.getByText('v0.0.1-SNAPSHOT')).toBeInTheDocument()
      expect(screen.getByText(/Build date/i)).toBeInTheDocument()
    })
  })

  it('должен закрывать modal при клике на кнопку Close', async () => {
    render(<Home />)

    const versionButton = screen.getByText(/version/i)
    fireEvent.click(versionButton)

    await waitFor(() => {
      expect(screen.getByText('Version Information')).toBeInTheDocument()
    })

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Version Information')).not.toBeInTheDocument()
    })
  })

  it('должен закрывать modal при клике на overlay', async () => {
    render(<Home />)

    const versionButton = screen.getByText(/version/i)
    fireEvent.click(versionButton)

    await waitFor(() => {
      expect(screen.getByText('Version Information')).toBeInTheDocument()
    })

    const overlay = screen.getByLabelText('Overlay')
    fireEvent.click(overlay)

    await waitFor(() => {
      expect(screen.queryByText('Version Information')).not.toBeInTheDocument()
    })
  })
})
