"""
Patch for bcrypt compatibility with passlib
"""

import bcrypt

# Add the missing __about__ attribute to bcrypt module
if not hasattr(bcrypt, '__about__'):
    bcrypt.__about__ = type('module', (), {'__version__': getattr(bcrypt, '__version__', 'unknown')})()