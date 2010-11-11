// Copyright 2010 Google Inc. All Rights Reserved.

package edu.stanford.dge.claslite;
import com.google.gdata.client.ClientLoginAccountType;
import com.google.gdata.client.GoogleService;
import com.google.gdata.client.Service.GDataRequest;
import com.google.gdata.client.Service.GDataRequest.RequestType;

import com.google.gdata.util.AuthenticationException;
import com.google.gdata.util.ContentType;
import com.google.gdata.util.ServiceException;
import com.google.gdata.util.ResourceNotFoundException;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author thau@google.com (Dave Thau)
 *
 */
public class FusionTablesAccess {

//The example requires the Google GData Client library, 
//which in turn requires the
//Google Collection library. These can be downloaded from
//http://code.google.com/p/gdata-java-client/downloads/list and
//http://code.google.com/p/google-collections/downloads/list.



/**
* Code modified from the Java example using the Google Fusion Tables API 
* to query, insert, update, and delete.
* Uses the Google GDATA core library.
*
* @author googletables-feedback@google.com (Google Fusion Tables Team)
*/


 /**
  * Google Fusion Tables API URL stem.
  * All requests to the Google Fusion Tables server
  * begin with this URL.
  *
  * The next line is Google Fusion Tables API-specific code:
  */
 private static final String SERVICE_URL =
     "http://www.google.com/fusiontables/api/query";
 
 /**
  * CSV values are terminated by comma or end-of-line and consist either of
  * plain text without commas or quotes, or a quoted expression, where inner
  * quotes are escaped by doubling.
  */
 private static final Pattern CSV_VALUE_PATTERN =
     Pattern.compile("([^,\\r\\n\"]*|\"(([^\"]*\"\")*[^\"]*)\")(,|\\r?\\n)");

 private static final Pattern KML_PATTERN =
     Pattern.compile("^([^,]+),([^,]+)$");
 
 
 /**
  * Handle to the authenticated Google Fusion Tables service.
  *
  * This code uses the GoogleService class from the 
  * Google GData APIs Client Library.
  */
 private GoogleService service;

 /** 
  * Two versions of ApiExample() are provided:
  * one that accepts a Google user account ID and password for authentication,
  * and one that accepts an existing auth token.
  */

 /**
  * Authenticates the given account for {@code fusiontables} service using a
  * given email ID and password.
  *
  * @param email    Google account email. (For more information, see
  *                 http://www.google.com/support/accounts.)
  * @param password Password for the given Google account.
  *
  * This code instantiates the GoogleService class from the 
  * Google GData APIs Client Library,
  * passing in Google Fusion Tables API-specific parameters.
  * It then goes back to the Google GData APIs Client Library for the 
  * setUserCredentials() method.
  */
 public FusionTablesAccess(String email, String password)
     throws AuthenticationException {
   service = new GoogleService("fusiontables", "fusiontables.ApiExample");
   service.setUserCredentials(email, password, ClientLoginAccountType.GOOGLE);
 }

 /**
  * Authenticates for {@code fusiontables} service using the auth token. The
  * auth token can be retrieved for an authenticated user by invoking
  * service.getAuthToken() on the email and password. The auth token can be
  * reused rather than specifying the user name and password repeatedly.
  * 
  * @param authToken The auth token. (For more information, see
  *                  http://code.google.com/apis/gdata/auth.html#ClientLogin.)
  *
  * @throws AuthenticationException
  *
  * This code instantiates the GoogleService class from the 
  * Google Data APIs Client Library,
  * passing in Google Fusion Tables API-specific parameters.
  * It then goes back to the Google Data APIs Client Library for the 
  * setUserToken() method.
  */
 public FusionTablesAccess(String authToken) throws AuthenticationException {
   service = new GoogleService("fusiontables", "fusiontables.ApiExample");
   service.setUserToken(authToken);
 }

 /**
  * Fetches the results for a select query. Prints them to standard
  * output, surrounding every field with (@code |}.
  *
  * This code uses the GDataRequest class and getRequestFactory() method
  * from the Google Data APIs Client Library.
  * The Google Fusion Tables API-specific part is in the construction
  * of the service URL. A Google Fusion Tables API SELECT statement
  * will be passed in to this method in the selectQuery parameter.
  */
 public ArrayList<HashMap<String, String>> getPolygons(String selectQuery, HashMap<String, String> tables) throws IOException,
     ServiceException {
	 
	 ArrayList<HashMap<String,String>> result = new ArrayList<HashMap<String, String>>();
	 int index = 0;
	 for (String key : tables.keySet()) {
		 URL url = new URL(
			       SERVICE_URL + "?sql=" + URLEncoder.encode("select name, description from " + 
			    		   tables.get(key) + " where description contains ignoring case '" + selectQuery + "'", "UTF-8") + "&hdrs=false");
			   GDataRequest request = service.getRequestFactory().getRequest(
			           RequestType.QUERY, url, ContentType.TEXT_PLAIN);

			   
			   try {
				
				request.execute();
				
				 /* Prints the results of the query.                */
				 /* No Google Fusion Tables API-specific code here. */
				 /* This isn't particularly space efficient, but it'll do for now */

				 
				   Scanner scanner = new Scanner(request.getResponseStream(),"UTF-8");
				   String lineString;
				  
				   while (scanner.hasNextLine()) {

					   HashMap<String,String> thisLine = new HashMap<String, String>();
					   lineString = scanner.nextLine();
					   Matcher matcher = KML_PATTERN.matcher(lineString);
					   int groupCount;
					   
					   if (matcher.matches()) {
						   thisLine.put("index", Integer.toString(index));
						   index++;
						   thisLine.put("description", matcher.group(2));
						   thisLine.put("name", matcher.group(1));
						   thisLine.put("table_name", key);
						   thisLine.put("table_id", tables.get(key));
					   }
					   result.add(thisLine);
				   }
			} catch (ResourceNotFoundException e) {
				System.out.println("no results found in table " + tables.get(key));
				
			}
	 }
   return result;
 }

 

 /**
  * Fetches the results for a select query. Prints them to standard
  * output, surrounding every field with (@code |}.
  *
  * This code uses the GDataRequest class and getRequestFactory() method
  * from the Google Data APIs Client Library.
  * The Google Fusion Tables API-specific part is in the construction
  * of the service URL. A Google Fusion Tables API SELECT statement
  * will be passed in to this method in the selectQuery parameter.
  */
 public String getPolygon(String table, String row) throws IOException,
     ServiceException {
	 
	 URL url = new URL(
			 SERVICE_URL + "?sql=" + URLEncoder.encode("select geometry from " + 
			    		   table + " where name = '" + row + "'", "UTF-8") + "&hdrs=false");
			   GDataRequest request = service.getRequestFactory().getRequest(
			           RequestType.QUERY, url, ContentType.TEXT_PLAIN);

			   String result = "";
			   try {
				
				request.execute();
				
				 /* Prints the results of the query.                */
				 /* No Google Fusion Tables API-specific code here. */
				 /* This isn't particularly space efficient, but it'll do for now */

				   Scanner scanner = new Scanner(request.getResponseStream(),"UTF-8");
				   String lineString;
				   
				   result = scanner.nextLine();
				   System.out.println("found polygon " + result);
			} catch (ResourceNotFoundException e) {
				System.out.println("no results found for table " + table + " row " + row);
				//e.printStackTrace();
			}
	 
   return result;
 }
 
 
public HashMap<String, String> getTables() throws IOException, ServiceException {
		HashMap<String, String> result = new HashMap<String, String>();
		   URL url = new URL(
			       SERVICE_URL + "?sql=" + URLEncoder.encode("SHOW TABLES", "UTF-8") + "&hdrs=false");
			   GDataRequest request = service.getRequestFactory().getRequest(
			           RequestType.QUERY, url, ContentType.TEXT_PLAIN);

			   request.execute();
			   
			   Scanner scanner = new Scanner(request.getResponseStream(),"UTF-8");
			   String lineString;
			  
			   while (scanner.hasNextLine()) {
				   lineString = scanner.nextLine();
				   System.out.println(lineString);
				   String[] elements = lineString.split(",");
				   if (elements[1].contains("Public")) {
					   result.put(elements[1], elements[0]);
				   }
			   }


		return result;
		
	}

 
 
}

