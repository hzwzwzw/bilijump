from django.shortcuts import render
from django.http import JsonResponse
from bilijump.llmapi import *
from datetime import datetime

def bilijump(request):
    # last_request_time = request.session.get('last_request_time')
    
    # if last_request_time:
    #     time_since_last_request = (datetime.now() - last_request_time).total_seconds()
    #     if time_since_last_request < 30:
    #         return JsonResponse({'error': 'Requests are too frequent. Please wait before trying again.'}, status=429)
    
    # request.session['last_request_time'] = datetime.now()
    if request.method == 'POST':
        # Process the request data here
        data = request.POST.get('data', '')
        # Perform your processing logic
        if data is None or not isinstance(data, str):
            return JsonResponse({'error': 'Invalid data'}, status=400)
        response = send_request(data)
        if response:
            return JsonResponse({'response': response})
        else:
            return JsonResponse({'error': 'Failed to process the request'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
