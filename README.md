# RushMeBackend
[RushMe](https://github.com/RushMeTeam) is a platform to make Greek Life more accessible. As traditional fraternity rush campaigns leverage technology, physical calendars are succeeded by digital counterparts. By remaining open source, free, and school independent, RushMe has been developed with a strong Greek and student life in mind.

Users of the iOS and Android Apps can see fraternity profiles, get directions to houses, and access organized event calendars. Moreover, the platform allows user to subscribe to events to receive notifications and favorite fraternities to receive unobtrustive daily digests during rush. An aggregate of all calendars, profile photos for each fraternity, and a location-based view of fraternities provides the student body with relevant information, fostering a campus' knowledge, interest, and participation in their Greek Life.

RushMe has been implemented successfully at Rensselaer Polytechnic Institute. The platform can easily be implemented elsewhere, requiring only fraternity participation, at no cost--now, or in the future. Feel free to contact us if your school is interested.

#### Technical Details

1. Static Content:
  Static Content is stored on [Amazon S3](https://aws.amazon.com/s3/) using JSON Object for text and scaled images.

2. Static Content Changes:
  The platform will use [API Gateway](https://aws.amazon.com/api-gateway/) to call a Lambda function to compress and transform
  input files from the admin and store them in S3.

3. User Trends Storage:
  RushMe is exploring use of Amazon Cogntio User Pools to store user data, though integration will be challenging.


# Contribute to RushMe
The team welcomes contributions to RushMe. To contribute fork the repository, make (and document!) some changes and submit a pull request for us to look over. Approved changes will be included in the next release.

#### Contact Us
Regarding development or privacy concerns, [Adam Kuniholm](kuniha@rpi.edu).
To learn more about RPI's Interfraternity Council, [the Vice President of RPI IFC](ifc.rpi.recruitment@gmail.com)
