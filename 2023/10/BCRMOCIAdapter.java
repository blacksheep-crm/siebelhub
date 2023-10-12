//BCRM OCI Adapter
//Example to connect to Oracle Cloud Infrastructure using OCI Java SDK and REST API
//PURELY EDUCATIONAL
//DO NOT USE IN MISSION-CRITICAL ENVIRONMENTS!!!!!
package com.bcrm.jbs;

import com.siebel.data.SiebelPropertySet;
import com.siebel.eai.SiebelBusinessServiceException;

import java.io.*;
import java.net.*;
import java.security.*;
import java.security.Key;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.util.*;
import java.util.stream.Collectors;
import java.text.SimpleDateFormat;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

//getAuthHeader
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.hash.Hashing;

import org.apache.http.HttpEntity;
import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.entity.StringEntity;

import org.tomitribe.auth.signatures.MissingRequiredHeaderException;
import org.tomitribe.auth.signatures.PEM;
import org.tomitribe.auth.signatures.Signature;
import org.tomitribe.auth.signatures.Signer;

import java.lang.System;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.HashMap;
import java.util.Date;
import java.util.Arrays;
import java.util.function.Supplier;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.Base64;
//import com.google.common.base.Supplier;

import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.Region;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.auth.SimpleAuthenticationDetailsProvider;
import com.oracle.bmc.auth.StringPrivateKeySupplier;
import com.oracle.bmc.auth.SimplePrivateKeySupplier;
import com.oracle.bmc.model.BmcException;
import com.oracle.bmc.identity.IdentityClient;
import com.oracle.bmc.identity.requests.ListRegionsRequest;
import com.oracle.bmc.identity.responses.ListRegionsResponse;

//AI Vision
import com.oracle.bmc.aivision.AIServiceVisionClient;
import com.oracle.bmc.aivision.model.*;
import com.oracle.bmc.aivision.requests.*;
import com.oracle.bmc.aivision.responses.*;




public class BCRMOCIAdapter extends com.siebel.eai.SiebelBusinessService {    
    public void doInvokeMethod(String methodName, SiebelPropertySet input, SiebelPropertySet output) throws SiebelBusinessServiceException {
		try{
            if (methodName.toLowerCase().equals("invokeoci")){
                String context = input.getProperty("Context");
                String configurationFilePath = input.getProperty("configurationFilePath");
                String profile = input.getProperty("profile");
                if (configurationFilePath == null || configurationFilePath.equals("")){
                    configurationFilePath = ".\\ociconfig";
                }
                if (profile == null || profile.equals("")){
                    profile = "DEFAULT";
                } 
           
                ConfigFileReader.ConfigFile config = getConfigFile(configurationFilePath, profile);
                AuthenticationDetailsProvider provider = getAuthenticationProvider(config);

                //dispatch
                if (context.equals("Identity.Regions")){
                    getRegions(config, provider, output);
                }
                if (context.equals("Vision.AnalyzeImage")){
                    analyzeImage(config, provider, input.getProperty("imgdata"), output);
                }
            }
			//2023-10-08 ahansal: added getAuthHeader
			if (methodName.toLowerCase().equals("getauthheader")){
				String configurationFilePath = input.getProperty("configurationFilePath");
                String profile = input.getProperty("profile");
				if (configurationFilePath == null || configurationFilePath.equals("")){
                    configurationFilePath = ".\\ociconfig";
                }
                if (profile == null || profile.equals("")){
                    profile = "DEFAULT";
                }
                ConfigFileReader.ConfigFile config = getConfigFile(configurationFilePath, profile);
				getAuthHeader(config, input, output);
			}
            else{
                throw new SiebelBusinessServiceException("NO_SUCH_METHOD", "Unsupported method: " + methodName);
            }
        }
        catch (Exception e){
            output.setProperty("Error",e.toString());
        }
	}
	
    //2023-10-08 ahansal: added getAuthHeader
	private void getAuthHeader (ConfigFileReader.ConfigFile config, SiebelPropertySet input, SiebelPropertySet output) throws SiebelBusinessServiceException{
		try{
            String tenancyOcid = config.get("tenancy");
            String userOcid = config.get("user");
            String privateKeyPath = config.get("key_file");
            String fingerprint = config.get("fingerprint");
			String uri = input.getProperty("HTTPRequestURL");
			String method = input.getProperty("HTTPRequestMethod");

			//Example URL for GET instances
			//"https://iaas.eu-frankfurt-1.oraclecloud.com/20160918/instances/?compartmentId=ocid1.tenancy.oc1..aaaaaaaaxahtpmtqn2g57uetpf4y6yvt3c3jgg2etnt5swhccr3wn2gyiiua";
			
			String apiKey = tenancyOcid + "/" + userOcid + "/" + fingerprint;
			
			SimpleDateFormat DATE_FORMAT;
			DATE_FORMAT = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.US);
			DATE_FORMAT.setTimeZone(TimeZone.getTimeZone("GMT"));
			String timestamp = DATE_FORMAT.format(new Date());
			String response = "";
			
			//signature algorithm courtesy of https://blogs.oracle.com/ee-ces/post/oci-rest-api-made-simple---get-request-in-java
			
			PrivateKey privateKey = loadPrivateKey(privateKeyPath);

			HttpRequestBase GetRequest;
			HttpPost PostRequest;
			String authorizationHeader = "";
			
			if (method.toLowerCase().equals("put") || method.toLowerCase().equals("post")) {
				PostRequest = (HttpPost) new HttpPost(uri);
				String json = input.getProperty("HTTPRequestBody");
				StringEntity entity = new StringEntity(json);
				PostRequest.setEntity(entity);
				authorizationHeader = getSignature(apiKey, privateKey, PostRequest, timestamp, output);
			}
			if (method.toLowerCase().equals("get")){
				GetRequest = new HttpGet(uri);
				authorizationHeader = getSignature(apiKey, privateKey, GetRequest, timestamp, output);
			}
			
			output.setProperty("HDR_Authorization", authorizationHeader);
			output.setProperty("HDR_Date", timestamp);
        }
        catch (Exception e){
            throw new SiebelBusinessServiceException("Error in getAuthHeader: ", e.toString());
        }
	}
	
	/*
	private void sendRequest (String uri, String method, String timestamp, String authorizationHeader, SiebelPropertySet output) throws SiebelBusinessServiceException{
		try{
			String response = "";
			URL url = new URL(uri);
			//System.out.println("URL: " + uri);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(method);
            connection.setRequestProperty("Date", timestamp);
            //String authorizationHeader = "Signature version=\"1\",keyId=\"" + apiKey + "\",algorithm=\"rsa-sha256\",headers=\"" + headers + "\",signature=\"" + signatureBase64 + "\"";
			
            connection.setRequestProperty("Authorization", authorizationHeader);
            
            int responseCode = connection.getResponseCode();
            
            // Read and print the response
			output.setProperty("HTTPStatus", String.valueOf(responseCode));
            if (responseCode == HttpURLConnection.HTTP_OK) {
                InputStream responseStream = connection.getInputStream();
                Scanner scanner = new Scanner(responseStream);
                while (scanner.hasNextLine()) {
                    //System.out.println(scanner.nextLine());
					response += scanner.nextLine();
                }
                scanner.close();
                responseStream.close();
				output.setProperty("response",response);
            } else {
                output.setProperty("response","HTTP Request Failed with response code: " + responseCode);
            }
            
            connection.disconnect();
		}
		catch (Exception e){
            throw new SiebelBusinessServiceException("Error in sendRequest: ", e.toString());
        }
	}
	*/
	
	
	//signature algorithm courtesy of https://blogs.oracle.com/ee-ces/post/oci-rest-api-made-simple---get-request-in-java
	
    private PrivateKey loadPrivateKey(String privateKeyFilename) {
        try (InputStream privateKeyStream = Files.newInputStream(Paths.get(privateKeyFilename))){
            return PEM.readPrivateKey(privateKeyStream);
        } catch (InvalidKeySpecException e) {
                throw new RuntimeException("Invalid format for private key");
        } catch (IOException e) {
            throw new RuntimeException("Failed to load private key");
        }
    }
	
	private String getSignature(String apiKey, PrivateKey privateKey,HttpRequestBase request, String timestamp, SiebelPropertySet output){
		
        String SIGNATURE_ALGORITHM = "rsa-sha256";
		String method = request.getMethod().toLowerCase();
            
        
		Map<String, List<String>> REQUIRED_HEADERS;
		REQUIRED_HEADERS = ImmutableMap.<String, List<String>>builder()
                    .put("get", ImmutableList.of("x-date", "(request-target)", "host"))
                    .put("head", ImmutableList.of("x-date", "(request-target)", "host"))
                    .put("delete", ImmutableList.of("x-date", "(request-target)", "host"))
                    .put("put", ImmutableList.of("x-date", "(request-target)", "host", "content-length", "content-type", "x-content-sha256"))
                    .put("post", ImmutableList.of("x-date", "(request-target)", "host", "content-length", "content-type", "x-content-sha256"))
            .build();
        
        Map<String, Signer> signers;
		signers = REQUIRED_HEADERS
                    .entrySet().stream()
                    .collect(Collectors.toMap(
                            entry -> entry.getKey(),
                            entry -> buildSigner(apiKey, privateKey, entry.getKey(), SIGNATURE_ALGORITHM, REQUIRED_HEADERS)));
		
		
		String signature = signRequest(request, timestamp, REQUIRED_HEADERS, signers, output);
		//String dummy = "test";
		return signature;
	}
	     private Signer buildSigner(String apiKey, PrivateKey privateKey, String method, String SIGNATURE_ALGORITHM, Map<String, List<String>> REQUIRED_HEADERS) {
            final Signature signature = new Signature(
                    apiKey, SIGNATURE_ALGORITHM, null, REQUIRED_HEADERS.get(method.toLowerCase()));
            return new Signer(privateKey, signature);
        }
		
		private String signRequest(HttpRequestBase request, String timestamp, Map<String, List<String>> REQUIRED_HEADERS, Map<String, Signer> signers, SiebelPropertySet output) {
            final String method = request.getMethod().toLowerCase();
            // nothing to sign for options
            if (method.equals("options")) {
                return "";
            }
			//System.out.println("method: " + method);

            final String path = extractPath(request.getURI());
			//System.out.println("path: " + path);
            output.setProperty("path",path);
			
			// supply date if missing
            if (!request.containsHeader("x-date")) {
                request.addHeader("x-date", timestamp);
            }
			//System.out.println("date: " + timestamp);
            
			// supply host if missing
            if (!request.containsHeader("host")) {
                request.addHeader("host", request.getURI().getHost());
            }
			//System.out.println("host: " + request.getURI().getHost());
			output.setProperty("host", request.getURI().getHost());
			
            // supply content-type, content-length, and x-content-sha256 if missing (PUT and POST only)
            if (method.equals("put") || method.equals("post")) {
                if (!request.containsHeader("content-type")) {
                    request.addHeader("content-type", "application/json");
                }
				
                if (!request.containsHeader("content-length") || !request.containsHeader("x-content-sha256")) {
                    byte[] body = getRequestBody((HttpEntityEnclosingRequestBase) request);
                    if (!request.containsHeader("content-length")) {
                        request.addHeader("content-length", Integer.toString(body.length));
						//System.out.println("content-length: " + Integer.toString(body.length));
						output.setProperty("HDR_content-length",Integer.toString(body.length));
                    }
                    if (!request.containsHeader("x-content-sha256")) {
						final String sha256 = calculateSHA256(body);
                        request.addHeader("x-content-sha256", sha256);
						//System.out.println("x-content-sha256: " + calculateSHA256(body));
						output.setProperty("HDR_x-content-sha256",sha256);
                    }
                }
            }

            final Map<String, String> headers = extractHeadersToSign(request, REQUIRED_HEADERS);
            final String signature = calculateSignature(method, path, headers, signers);
            request.setHeader("Authorization", signature);
			//System.out.println("Authorization: " + signature);
			return signature;
        }
		
		private String extractPath(URI uri) {
            String path = uri.getRawPath();
            String query = uri.getRawQuery();
            if (query != null && !query.trim().isEmpty()) {
                path = path + "?" + query;
            }
            return path;
        }
		
		private byte[] getRequestBody(HttpEntityEnclosingRequestBase request) {
            HttpEntity entity = request.getEntity();
            // null body is equivalent to an empty string
            if (entity == null) {
                return "".getBytes(StandardCharsets.UTF_8);
            }
            // May need to replace the request entity after consuming
            boolean consumed = !entity.isRepeatable();
            ByteArrayOutputStream content = new ByteArrayOutputStream();
            try {
                entity.writeTo(content);
            } catch (IOException e) {
                throw new RuntimeException("Failed to copy request body", e);
            }
            // Replace the now-consumed body with a copy of the content stream
            byte[] body = content.toByteArray();
            if (consumed) {
                request.setEntity(new ByteArrayEntity(body));
            }
            return body;
        }
		
		private String calculateSHA256(byte[] body) {
            byte[] hash = Hashing.sha256().hashBytes(body).asBytes();
            return Base64.getEncoder().encodeToString(hash);
        }
		
		private Map<String, String> extractHeadersToSign(HttpRequestBase request, Map<String, List<String>> REQUIRED_HEADERS) {
            List<String> headersToSign = REQUIRED_HEADERS.get(request.getMethod().toLowerCase());
            if (headersToSign == null) {
                throw new RuntimeException("Don't know how to sign method " + request.getMethod());
            }
            return headersToSign.stream()
                    // (request-target) is a pseudo-header
                    .filter(header -> !header.toLowerCase().equals("(request-target)"))
                    .collect(Collectors.toMap(
                    header -> header,
                    header -> {
                        if (!request.containsHeader(header)) {
                            throw new MissingRequiredHeaderException(header);
                        }
                        if (request.getHeaders(header).length > 1) {
                            throw new RuntimeException(
                                    String.format("Expected one value for header %s", header));
                        }
                        return request.getFirstHeader(header).getValue();
                    }));
        }
		
		private String calculateSignature(String method, String path, Map<String, String> headers, Map<String, Signer> signers) {
            Signer signer = signers.get(method);
            if (signer == null) {
                throw new RuntimeException("Don't know how to sign method " + method);
            }
            try {
                return signer.sign(method, path, headers).toString();
            } catch (IOException e) {
                throw new RuntimeException("Failed to generate signature", e);
            }
        }
		
		
    private ConfigFileReader.ConfigFile getConfigFile (String configurationFilePath, String profile) throws SiebelBusinessServiceException{
        try{
            ConfigFileReader.ConfigFile config = ConfigFileReader.parse(configurationFilePath, profile);
            return config;
        }
        catch (Exception e){
            throw new SiebelBusinessServiceException("Error in getConfigFile: ", e.toString());
        }
    }
    private AuthenticationDetailsProvider getAuthenticationProvider(ConfigFileReader.ConfigFile config) throws SiebelBusinessServiceException{
        try{
            AuthenticationDetailsProvider provider = new ConfigFileAuthenticationDetailsProvider(config);
            return provider;
        }
        catch (Exception e){
            throw new SiebelBusinessServiceException("Error in getAuthenticationProvider: ", e.toString());
        }
    }

    private void getRegions (ConfigFileReader.ConfigFile config, AuthenticationDetailsProvider provider, SiebelPropertySet output) throws SiebelBusinessServiceException{
        try{
            final IdentityClient identityClient = new IdentityClient(provider);
            identityClient.setRegion(config.get("region"));
            final ListRegionsResponse response = identityClient.listRegions(ListRegionsRequest.builder().build());
            List<com.oracle.bmc.identity.model.Region> regions = response.getItems();
            for (int i = 0; i < regions.size(); i++){
                output.setProperty("region" + i, regions.get(i).getName());
            }
        }
        catch (Exception e){
            throw new SiebelBusinessServiceException("Error in getRegions: ", e.toString());
        }
    }

    private void analyzeImage (ConfigFileReader.ConfigFile config, AuthenticationDetailsProvider provider, String imgdata, SiebelPropertySet output) {
      try{
        /* Create a service client */
        AIServiceVisionClient client = new AIServiceVisionClient(provider);
        String compartmentId = (config.get("compartmentid"));
        
        /*decode base64*/
        byte[] decodedBytes = Base64.getDecoder().decode(imgdata);
        
        /* Create a request and dependent object(s). */
	    AnalyzeImageDetails analyzeImageDetails = AnalyzeImageDetails.builder()
		    .features(new ArrayList<>(Arrays.asList(ImageClassificationFeature.builder().build())))
		    .image(InlineImageDetails.builder()
                .data(decodedBytes).build())
		    .compartmentId(compartmentId).build();

	    AnalyzeImageRequest analyzeImageRequest = AnalyzeImageRequest.builder()
		    .analyzeImageDetails(analyzeImageDetails)
		    .opcRequestId("1111111111").build();

        AnalyzeImageResponse response = client.analyzeImage(analyzeImageRequest);
        AnalyzeImageResult result = response.getAnalyzeImageResult();

        List<Label> lbls = result.getLabels();
        SiebelPropertySet lblps = new SiebelPropertySet();
        lblps.setType("labels");
        
        for (int i = 0; i < lbls.size(); i++){
                lblps.setProperty(lbls.get(i).getName(), lbls.get(i).getConfidence().toString());
        }

        output.addChild(lblps);
      }
      catch (Exception e){
          throw (e);
      }
    }   
}