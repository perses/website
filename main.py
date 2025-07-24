"""
MkDocs macros for Perses website
"""

def define_env(env):
    """
    This is the hook for defining variables, macros and filters
    """
    
    @env.macro
    def feature(title, description, image, reverse=False):
        """
        Create a feature section with title, description, and image
        
        Args:
            title: The feature title (e.g., "Observability Display")
            description: The feature description
            image: Path to the image (e.g., "assets/images/feature1.png")
            reverse: Boolean, if True creates reverse layout (text-image instead of image-text)
        
        Returns:
            HTML string for the feature section
        """
        reverse_class = " reverse" if reverse else ""
        
        return f'''<div class="feature-section{reverse_class}" markdown>
<div class="feature-content" markdown>
<div class="feature-title" markdown>
### {title}
</div>
<div class="feature-text" markdown>
{description}
</div>
</div>
<div class="feature-image" markdown>
![{title}]({image})
</div>
</div>'''
