"""
Educational Resource Finder
Genera enlaces a recursos educativos basados en el tema detectado.
"""

from urllib.parse import quote


def generate_resource_links(topic: str, subject: str = "") -> dict:
    """
    Genera enlaces de búsqueda a plataformas educativas.
    
    Args:
        topic: Tema específico detectado (ej: "ecuaciones de segundo grado")
        subject: Materia general (ej: "Matemáticas")
    
    Returns:
        Diccionario con recursos categorizados
    """
    topic_encoded = quote(topic)
    subject_encoded = quote(subject) if subject else topic_encoded
    
    return {
        'videos': [
            {
                'title': f'"{topic}" - Khan Academy',
                'url': f'https://es.khanacademy.org/search?q={topic_encoded}',
                'platform': 'Khan Academy',
                'icon': '📺'
            },
            {
                'title': f'Video explicativo: {topic}',
                'url': f'https://youtube.com/results?search_query={topic_encoded}+explicación+completa',
                'platform': 'YouTube',
                'icon': '🎬'
            }
        ],
        'exercises': [
            {
                'title': f'Ejercicios prácticos de {topic}',
                'url': f'https://www.google.com/search?q={topic_encoded}+ejercicios+resueltos',
                'platform': 'Google',
                'icon': '📝'
            },
            {
                'title': f'Problemas de {topic}',
                'url': f'https://es.khanacademy.org/search?q={topic_encoded}+práctica',
                'platform': 'Khan Academy',
                'icon': '✏️'
            }
        ],
        'interactive': [
            {
                'title': f'Simuladores: {topic}',
                'url': f'https://phet.colorado.edu/es/search?q={topic_encoded}',
                'platform': 'PhET',
                'icon': '🎮'
            },
            {
                'title': f'Actividad interactiva: {topic}',
                'url': f'https://www.google.com/search?q={topic_encoded}+simulador+interactivo',
                'platform': 'Web',
                'icon': '🖱️'
            }
        ],
        'reference': [
            {
                'title': f'{topic} - Wikipedia',
                'url': f'https://es.wikipedia.org/w/index.php?search={topic_encoded}',
                'platform': 'Wikipedia',
                'icon': '📖'
            },
            {
                'title': f'Artículos académicos: {topic}',
                'url': f'https://scholar.google.com/scholar?q={topic_encoded}',
                'platform': 'Google Scholar',
                'icon': '🎓'
            }
        ]
    }


def analyze_topic_response(response_text: str) -> dict:
    """
    Procesa la respuesta de la IA para extraer información del tema.
    
    Args:
        response_text: Texto crudo de la respuesta de Gemini
    
    Returns:
        Diccionario con subject, topic, level, keywords
    """
    import json
    import re
    
    try:
        # Intentar extraer JSON de la respuesta
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            data = json.loads(json_match.group())
            return {
                'subject': data.get('subject', 'General'),
                'topic': data.get('topic', response_text[:50]),
                'level': data.get('level', 'No especificado'),
                'keywords': data.get('keywords', [])
            }
    except:
        pass
    
    # Fallback: usar texto plano
    return {
        'subject': 'General',
        'topic': response_text.strip()[:100],
        'level': 'No especificado',
        'keywords': []
    }
