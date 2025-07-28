"""
MkDocs macros for Perses website
"""

def define_env(env):
    """
    This is the hook for defining variables, macros and filters
    """
    
    @env.macro
    def feature(title, description, media, learn_more=None, reverse=False):
        """
        Create a feature section with title, description, and media (image/video)
        
        Args:
            title: The feature title (e.g., "Observability Display")
            description: The feature description
            media: Path to the media file (e.g., "assets/images/feature1.png", "assets/videos/demo.mp4"..)
            learn_more: Optional URL for "Learn more" link
            reverse: Boolean, if True creates reverse layout (text-media instead of media-text)
        
        Returns:
            HTML string for the feature section
        """
        reverse_class = " reverse" if reverse else ""
        
        learn_more_link = ""
        if learn_more:
            learn_more_link = f'[→ Learn more]({learn_more})'
        
        # Check if the media is a video file
        if media.lower().endswith(('.mp4', '.webm', '.mov')):
            media_element = f'<video autoplay muted loop playsinline onclick="this.paused ? this.play() : this.pause()"><source src="{media}" type="video/mp4"></video>'
        else:
            media_element = f'<img alt="{title}" src="{media}"/>'
        
        return f'''<div class="feature-section{reverse_class}" markdown>
<div class="feature-content" markdown>
<div class="feature-title" markdown>
## {title}
</div>
<div class="feature-text" markdown>
{description}

{learn_more_link}
</div>
</div>
<div class="feature-image">
{media_element}
</div>
</div>'''
