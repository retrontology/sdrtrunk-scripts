#!/usr/bin/env python3

from xml.etree import ElementTree
import argparse
import os.path


SAMPLE_RATE = '8000'
BITRATE = '16'
CHANNELS = '1'
USERNAME = 'source'
PASSWORD = 'hackme'
HOST = 'localhost'
PORT = '8000'
PUBLIC = 'false'
INLINE = 'true'
DELAY = '0'
MAX_RECORDING_AGE = '60000'
FORMAT = 'MP3'

def parse_args():
    parser = argparse.ArgumentParser(
        description='Script that creates am Icecast2 stream(s) for each alias in SDRTrunk'
    )
    parser.add_argument(
        'profile',
        help='XML profile file you want to add stream(s) to'
    )
    parser.add_argument(
        '-s', '--sample-rate',
        default=SAMPLE_RATE,
        dest='sample_rate',
        help='Sample rate of the stream(s)'
    )
    parser.add_argument(
        '-b', '--bitrate',
        default=BITRATE,
        help='Bitrate of the stream(s)'
    )
    parser.add_argument(
        '--channels',
        default=CHANNELS,
        help='Number of channels for the stream(s)'
    )
    parser.add_argument(
        '-d', '--delay',
        default=DELAY,
        help='Delay of the stream(s)'
    )
    parser.add_argument(
        '-u', '--username',
        default=USERNAME,
        help='Username of the Icecast source user'
    )
    parser.add_argument(
        '-p', '--password',
        default=PASSWORD,
        help='Password of the Icecast source user'
    )
    parser.add_argument(
        '--host',
        default=HOST,
        help='IP of the Icecast server'
    )
    parser.add_argument(
        '--port',
        default=PORT,
        help='Port of the Icecast server'
    )
    parser.add_argument(
        '--public',
        default=PUBLIC,
        help='Whether to set the stream(s) to public or not'
    )
    parser.add_argument(
        '--inline',
        default=INLINE,
        help='Whether to display the metadata of the stream(s) inline or not'
    )
    parser.add_argument(
        '-m', '--max-recording-age',
        dest='max_recording_age',
        default=MAX_RECORDING_AGE,
        help='Maximum recording age of the stream(s)'
    )
    parser.add_argument(
        '-f', '--format',
        default=FORMAT,
        help='Format of the stream(s)'
    )
    parser.add_argument(
        '-o', '--output',
        default=None,
        help='File to output the XML with the newly created stream(s)'
    )
    parser.add_argument(
        '-c', '--clear',
        default=False,
        action='store_true',
        help='Whether you want to clear the existing streams from the XML or not'
    )
    return parser.parse_args()

def main():
    args = parse_args()
    xml = ElementTree.parse(args.profile)
    playlist = xml.getroot()
    if args.clear:
        for stream in xml.findall('stream'):
            playlist.remove(stream)
    count = 0
    for alias in xml.findall('alias'):
        if args.clear:
            for id in alias.findall('id'):
                if id.get('type') == 'broadcastChannel':
                    alias.remove(id)
        name = alias.get('name')
        group = alias.get('group')
        stream = create_stream(
            name,
            group,
            count,
            host=args.host,
            port=args.port,
            username=args.username,
            password=args.password,
            format=args.format,
            sample_rate=args.sample_rate,
            bitrate=args.bitrate,
            channels=args.channels,
            public=args.public,
            inline=args.inline,
            delay=args.delay,
            max_recording_age=args.max_recording_age
        )
        broadcast = ElementTree.Element('id')
        broadcast.set('type', 'broadcastChannel')
        broadcast.set('channel', name)
        alias.append(broadcast)
        playlist.append(stream)
        count += 1
    if args.output == None:
        output = os.path.basename(args.profile)
        output = os.path.splitext(output)[0]
        output += 'streams.xml'
    else:
        output = args.output
    ElementTree.indent(xml, space="    ", level=0)
    xml.write(output, short_empty_elements=False)
    

def create_stream(
        name,
        group,
        index,
        host = HOST,
        port = PORT,
        username = USERNAME,
        password = PASSWORD,
        format = FORMAT,
        sample_rate = SAMPLE_RATE,
        bitrate = BITRATE,
        channels = CHANNELS,
        public = PUBLIC,
        inline = INLINE,
        delay = DELAY,
        max_recording_age = MAX_RECORDING_AGE
    ):
    stream = ElementTree.Element('stream')
    stream.set('type', 'icecastHTTPConfiguration')
    stream.set(f'xmlns:wstxns{index}', 'http://www.w3.org/2001/XMLSchema-instance')
    stream.set(f'wstxns{index}:type', 'ICECAST_HTTP')
    stream.set('description', name)
    stream.set('sample_rate', sample_rate)
    stream.set('user_name', username)
    stream.set('bitrate', bitrate)
    stream.set('channels', channels)
    stream.set('mount_point', f'/{pathify_name(name)}')
    stream.set('public', public)
    stream.set('inline', inline)
    stream.set('delay', delay)
    stream.set('host', host)
    stream.set('enabled', 'true')
    stream.set('port', port)
    stream.set('password', password)
    stream.set('maximum_recording_age', max_recording_age)
    stream.set('genre', group)
    stream.set('name', name)
    format_element = ElementTree.Element('format')
    format_element.text=format
    stream.append(format_element)
    return stream
    
def pathify_name(name:str):
    name = name.replace(' ', '')
    name = name.lower()
    return name

if __name__ == "__main__":
    main()