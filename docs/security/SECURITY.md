# Security Policy

## Supported Versions

We provide security updates for the following versions of Chirp:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| 0.9.x   | :white_check_mark: |
| 0.8.x   | :x:                |
| < 0.8   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Chirp, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing our security team at:

**Email**: security@chirp.app

### What to Include

When reporting a vulnerability, please include the following information:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: The potential impact of the vulnerability
- **Environment**: Your environment details (OS, browser, app version, etc.)
- **Proof of Concept**: If applicable, include a proof of concept or exploit code
- **Suggested Fix**: If you have ideas for how to fix the issue

### Response Timeline

We are committed to responding to security reports in a timely manner:

- **Initial Response**: Within 24 hours of receiving your report
- **Status Updates**: Every 7 days until the issue is resolved
- **Resolution Timeline**: 
  - Critical vulnerabilities: Within 7 days
  - High severity: Within 30 days
  - Medium severity: Within 90 days
  - Low severity: Within 180 days

### What to Expect

#### If Your Report is Accepted:

1. **Acknowledgment**: You'll receive confirmation that we've received and accepted your report
2. **Investigation**: Our team will investigate the vulnerability
3. **Fix Development**: We'll develop and test a fix
4. **Coordination**: We'll coordinate with you on the disclosure timeline
5. **Credit**: You'll be credited in our security advisories (unless you prefer to remain anonymous)
6. **Disclosure**: We'll publish a security advisory when the fix is released

#### If Your Report is Declined:

1. **Explanation**: We'll provide a clear explanation of why the report was declined
2. **Appeal Process**: You can appeal the decision if you believe it was made in error
3. **Public Disclosure**: You're free to disclose the issue publicly after our response

### Security Measures

Chirp implements the following security measures:

#### Authentication & Authorization
- Supabase Auth integration with secure session management
- Row Level Security (RLS) policies on all database tables
- JWT token-based authentication
- Secure password hashing with bcrypt

#### Data Protection
- End-to-end encryption for sensitive data
- Secure API endpoints with proper validation
- Input sanitization and validation
- SQL injection prevention through parameterized queries

#### Infrastructure Security
- HTTPS enforcement for all communications
- Secure database connections
- Regular security updates and dependency management
- Environment variable protection for sensitive configuration

#### Privacy Protection
- Minimal data collection principle
- User data anonymization where possible
- Secure data deletion capabilities
- Privacy-by-design architecture

### Security Best Practices for Users

#### For End Users:
- Keep your app updated to the latest version
- Use strong, unique passwords
- Enable two-factor authentication when available
- Be cautious of phishing attempts
- Report suspicious activity immediately

#### For Developers:
- Follow secure coding practices
- Keep dependencies updated
- Use environment variables for sensitive configuration
- Implement proper input validation
- Follow the principle of least privilege

### Security Advisories

Security advisories are published in the following locations:

- **GitHub Security Advisories**: https://github.com/chirp-app/chirp/security/advisories
- **Project Website**: https://chirp.app/security
- **Email Notifications**: Subscribe to security updates at security@chirp.app

### Bug Bounty Program

We currently do not operate a formal bug bounty program, but we do appreciate security researchers who help us improve our security posture. While we don't offer monetary rewards, we do provide:

- Recognition in our security advisories
- Early access to new features for testing
- Direct communication with our security team
- Swag and other non-monetary rewards

### Contact Information

For general security questions or concerns:

- **Email**: security@chirp.app
- **PGP Key**: Available upon request
- **Response Time**: Within 48 hours for general inquiries

### Legal

By reporting a security vulnerability, you agree to:

- Not publicly disclose the vulnerability until we've had a chance to address it
- Not access or modify data that doesn't belong to you
- Not disrupt our services or systems
- Comply with applicable laws and regulations

### Acknowledgments

We would like to thank the following security researchers who have helped improve Chirp's security:

- [To be updated as reports are received]

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Next Review**: January 2026

---

*This security policy is subject to change. Please check back regularly for updates.*
